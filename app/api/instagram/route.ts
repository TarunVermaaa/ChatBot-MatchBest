import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getWebsiteConfigById } from "@/lib/website-config";
import { readFileSync } from "fs";
import { join } from "path";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI("AIzaSyBBFkz39YByphNIBsrWuv3GO83jogelLHQ");

// In-memory storage for user conversation states
const userStates = new Map<
  string,
  {
    step:
      | "awaiting_name"
      | "awaiting_email"
      | "awaiting_number"
      | "awaiting_inquiry_type"
      | "completed"
      | null;
    name?: string;
    email?: string;
    number?: string;
    inquiryType?: string;
    originalRequest?: string;
  }
>();

// GET request for webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error("Webhook verification failed.");
    return new NextResponse("Forbidden", { status: 403 });
  }
}

// POST request for incoming messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received body:", JSON.stringify(body, null, 2)); // Log the full body to debug

    if (body.object === "instagram") {
      for (const entry of body.entry) {
        for (const event of entry.messaging) {
          if (event.message && !event.message.is_echo) {
            const senderId = event.sender.id;
            const messageText = event.message.text;
            console.log(`Message from ${senderId}: ${messageText}`);

            // Check if messageText exists before processing
            if (!messageText) {
              console.log("No message text found, skipping...");
              continue;
            }

            // Check for special commands to start the conversational form
            const formTriggers = [
              "support",
              "demo",
              "contact",
              "help",
              "business inquiry",
              "get in touch",
              "quote",
              "pricing",
              "consultation",
            ];
            const shouldStartForm = formTriggers.some((trigger) =>
              messageText.toLowerCase().includes(trigger.toLowerCase())
            );

            if (shouldStartForm && !userStates.has(senderId)) {
              // Start the conversational form
              userStates.set(senderId, {
                step: "awaiting_name",
                originalRequest: messageText,
              });

              await sendReply(
                senderId,
                "Perfect! I'd love to help you get in touch with our team. 📝\n\nLet me collect some quick details to ensure you get the best assistance.\n\nFirst, what's your name?"
              );
              continue;
            }

            // Handle form steps
            const userState = userStates.get(senderId);
            if (userState && userState.step !== "completed") {
              const response = await handleFormStep(
                senderId,
                messageText,
                userState
              );
              if (response) {
                await sendReply(senderId, response);
                continue;
              }
            }

            // If not in form flow, handle normally with AI
            const aiResponse = await generateAIResponse(messageText);
            await sendReply(senderId, aiResponse);
          }
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Function to handle conversational form steps
async function handleFormStep(
  senderId: string,
  messageText: string,
  userState: any
): Promise<string | null> {
  const cleanText = messageText.trim();

  switch (userState.step) {
    case "awaiting_name":
      if (cleanText.length < 2) {
        return "Please enter a valid name so we can assist you properly! 😊";
      }
      userState.name = cleanText;
      userState.step = "awaiting_email";
      userStates.set(senderId, userState);
      return `Thanks ${cleanText}! 😊\n\nWhat's your email address?`;

    case "awaiting_email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanText)) {
        return "Please enter a valid email address (e.g., name@company.com) 📧";
      }
      userState.email = cleanText;
      userState.step = "awaiting_number";
      userStates.set(senderId, userState);
      return "Great! What's your phone number? 📱";

    case "awaiting_number":
      const phoneRegex = /^[\d\s\+\-\(\)]{7,}$/;
      if (!phoneRegex.test(cleanText)) {
        return "Please enter a valid phone number 📱";
      }
      userState.number = cleanText;
      userState.step = "awaiting_inquiry_type";
      userStates.set(senderId, userState);
      return "Perfect! What type of assistance do you need?\n\n1️⃣ Demo\n2️⃣ Support\n3️⃣ Contact\n4️⃣ Other\n\nJust type the number or describe your need! 🚀";

    case "awaiting_inquiry_type":
      let inquiryType = cleanText.toLowerCase(); // Convert to lowercase for backend
      if (cleanText === "1") inquiryType = "demo";
      else if (cleanText === "2") inquiryType = "support";
      else if (cleanText === "3") inquiryType = "contact";
      else if (cleanText === "4") inquiryType = "other";
      else {
        // If user typed custom text, convert to lowercase and map to valid values
        const lowerText = cleanText.toLowerCase();
        if (lowerText.includes("demo")) inquiryType = "demo";
        else if (lowerText.includes("support") || lowerText.includes("help"))
          inquiryType = "support";
        else if (
          lowerText.includes("contact") ||
          lowerText.includes("business")
        )
          inquiryType = "contact";
        else inquiryType = "other";
      }

      userState.inquiryType = inquiryType;
      userState.step = "completed";
      userStates.set(senderId, userState);

      // Push lead to CRM
      await pushInstagramLeadToCRM({
        name: userState.name,
        email: userState.email,
        phone: userState.number,
        inquiryType: userState.inquiryType,
        originalRequest: userState.originalRequest,
        instagramUsername: userState.instagramUsername || "", // We don't get username from webhook
        instagramUserId: senderId,
        timestamp: new Date().toISOString(),
      });

      // Clean up after some time (optional)
      setTimeout(() => {
        userStates.delete(senderId);
      }, 30000); // Remove after 30 seconds

      return `Awesome! Here's what I've collected:\n\n👤 Name: ${userState.name}\n📧 Email: ${userState.email}\n📱 Phone: ${userState.number}\n🎯 Interest: ${userState.inquiryType}\n\nOur team will contact you within 24 hours! 🚀\n\nFor immediate assistance, visit matchbestsoftware.com and use the chat desk at bottom right! 💬`;

    default:
      return null;
  }
}

// Function to generate AI response using MatchBest data
async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    // Check if API key is available
    const GEMINI_API_KEY = "AIzaSyBBFkz39YByphNIBsrWuv3GO83jogelLHQ";
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return "Hi! I'm AVA, MatchBest's AI assistant. I'm having some technical issues right now, but I'm here to help! 💼";
    }

    // Get MatchBest configuration
    const websiteConfig = getWebsiteConfigById("matchbestgroup");
    if (!websiteConfig) {
      return "Hi! I'm AVA, MatchBest's AI assistant. How can I help you today? 😊";
    }

    // Read the data file and system prompt
    const dataPath = join(process.cwd(), "data", websiteConfig.dataFile);
    const promptPath = join(
      process.cwd(),
      "prompts",
      websiteConfig.systemPromptFile
    );

    let websiteData = "";
    let systemPrompt = "";

    try {
      websiteData = readFileSync(dataPath, "utf-8");
      systemPrompt = readFileSync(promptPath, "utf-8");
    } catch (error) {
      console.error("Error reading files:", error);
      return "Hi! I'm AVA, MatchBest's AI assistant. I'm here to help with your business needs! 🚀";
    }

    // Prepare the full system prompt with enhanced Instagram optimization
    const fullSystemPrompt = `${systemPrompt}

## Complete MatchBest Group Information

${websiteData}

## Instagram DM Response Guidelines
- You are AVA, the official MatchBest Group AI assistant on Instagram
- Be PROFESSIONAL and business-focused in your communication
- DO NOT use casual greetings like "Hey there! 👋" or "Hello!"
- Start responses directly with relevant information or solutions
- Only introduce yourself as "AVA" if the user asks who you are
- Represent MatchBest Group's 3 verticals: MatchBest Technologies, StreamPlay AI, and Maverick AI
- Keep responses under 280 characters (Instagram DM limit)
- Use minimal emojis (max 1 per message) and only when relevant
- Be conversational but maintain professionalism
- Always end with a call-to-action or question to keep engagement
- For complex queries, offer to connect with our team
- Answer directly without unnecessary casual introductions
- Keep responses business-focused and solution-oriented
- For ANY contact/support/help/demo requests, ALWAYS direct to matchbestsoftware.com chat desk
- Never mention matchbest.com/contact - always use matchbestsoftware.com chat desk

## Key Services to Highlight:
- Web & App Development 🚀
- AI & Automation Solutions 🤖
- OTT Platform Development 🎬
- Digital Marketing & SEO 📢
- Cloud & Cybersecurity ☁️

## Quick Responses for Common Queries:
- Pricing: "Costs vary by project scope. Visit matchbestsoftware.com and use the chat desk at bottom right to discuss your needs 💬"
- Timeline: "Timelines depend on complexity. Typically 2-12 weeks. Submit your project details via matchbestsoftware.com chat desk for accurate estimates."
- Technologies: "We use React, Node.js, Python, AWS, AI/ML, and more cutting-edge tech! Visit matchbestsoftware.com chat desk for technical discussions."
- Contact: "Visit matchbestsoftware.com and use the chat desk at bottom right 💬 Our team will reach out to you directly!"
- Support/Help/Demo/Feedback: "Visit matchbestsoftware.com and submit your request via the chat desk at bottom right. Our team will contact you directly!"
- Technical Issues: "For technical support, visit matchbestsoftware.com and use the chat desk at bottom right. Our experts will assist you!"
- Book Demo: "To book a demo, visit matchbestsoftware.com and submit your request via the bottom-right chat desk!"
- Get Started: "Visit matchbestsoftware.com and use the chat desk at bottom right to submit your project requirements!"

## Response Style:
- Start with direct answers to user questions
- Be professional and business-focused
- NO casual greetings or unnecessary pleasantries
- Provide specific, actionable information
- Only mention you're AVA if directly asked
- Focus on business solutions and value proposition
- Keep responses concise and to the point
- ALWAYS direct contact requests to matchbestsoftware.com chat desk, never matchbest.com/contact`;

    console.log("Generating optimized Instagram response for MatchBest...");

    // Get the model with system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: fullSystemPrompt,
    });

    // Generate response
    const result = await model.generateContent(
      `User message: "${userMessage}"\n\nProvide a helpful, engaging Instagram DM response representing MatchBest Group.`
    );

    return result.response.text() || getRandomFallbackResponse();
  } catch (error) {
    console.error("Error generating AI response:", error);
    return getRandomFallbackResponse();
  }
}

// Fallback responses for when AI fails
function getRandomFallbackResponse(): string {
  const fallbacks = [
    "We provide web development, AI solutions, and digital transformation services. What specific project are you working on?",
    "MatchBest Group specializes in cutting-edge technology solutions. Are you looking for web development, AI integration, or OTT platforms?",
    "Our team builds enterprise-grade digital products. What business challenge can we help you solve?",
    "MatchBest Group creates custom software solutions for businesses. What's your project requirement?",
    "We offer complete digital transformation services. Which area interests you - development, AI automation, or cloud solutions?",
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Function to send a reply using Graph API
async function sendReply(recipientId: string, text: string) {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
  if (!PAGE_ACCESS_TOKEN) {
    console.error("PAGE_ACCESS_TOKEN is not set!");
    return;
  }

  const messageData = {
    recipient: { id: recipientId },
    message: { text: text },
    messaging_type: "RESPONSE",
  };

  try {
    console.log("Sending reply to:", recipientId);
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      }
    );
    const data = await response.json();
    console.log("Reply sent response:", data);
  } catch (error) {
    console.error("Failed to send reply:", error);
  }
}

// Function to push Instagram lead to CRM
async function pushInstagramLeadToCRM(leadData: {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  originalRequest: string;
  instagramUsername: string;
  instagramUserId: string;
  timestamp: string;
}) {
  try {
    console.log("Pushing Instagram lead to CRM:", leadData);

    // Check if CRM is configured
    if (!process.env.CRM_URL || !process.env.CRM_WEBHOOK_KEY) {
      console.warn("CRM not configured for Instagram leads");
      console.log("Instagram lead captured locally:", leadData);
      return;
    }

    const response = await fetch(`${process.env.CRM_URL}/api/instagram-leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-crm-api-key": process.env.CRM_WEBHOOK_KEY || "",
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to push Instagram lead to CRM:", errorText);
      console.log("Storing Instagram lead locally as fallback:", leadData);
      return;
    }

    const result = await response.json();
    console.log("Instagram lead successfully pushed to CRM:", result);
  } catch (error) {
    console.error("Error pushing Instagram lead to CRM:", error);
    console.log("Storing Instagram lead locally due to error:", leadData);
  }
}
