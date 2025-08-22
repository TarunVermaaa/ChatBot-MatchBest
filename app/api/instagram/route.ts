import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { getWebsiteConfigById } from "@/lib/website-config";
import { readFileSync } from "fs";
import { join } from "path";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

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

            // Generate AI response using MatchBest data
            const aiResponse = await generateAIResponse(messageText);

            // Send the AI reply
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

// Function to generate AI response using MatchBest data
async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not set");
      return "Hi! I'm MatchBest AI assistant. I'm having some technical issues right now, but I'm here to help! 💼";
    }

    // Get MatchBest configuration
    const websiteConfig = getWebsiteConfigById("matchbestgroup");
    if (!websiteConfig) {
      return "Hi! I'm MatchBest AI assistant. How can I help you today? 😊";
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
      return "Hi! I'm MatchBest AI assistant. I'm here to help with your business needs! 🚀";
    }

    // Prepare the full system prompt with enhanced Instagram optimization
    const fullSystemPrompt = `${systemPrompt}

## Complete MatchBest Group Information

${websiteData}

## Instagram DM Response Guidelines
- You are the official MatchBest Group AI assistant on Instagram
- Represent MatchBest Group's 3 verticals: MatchBest Technologies, StreamPlay AI, and Maverick AI
- Keep responses under 280 characters (Instagram DM limit)
- Use 1-2 relevant emojis per message
- Be conversational, friendly, and professional
- Always end with a call-to-action or question to keep engagement
- For complex queries, offer to connect with our team
- Use Hinglish when appropriate for Indian audience

## Key Services to Highlight:
- Web & App Development 🚀
- AI & Automation Solutions 🤖
- OTT Platform Development 🎬
- Digital Marketing & SEO 📢
- Cloud & Cybersecurity ☁️

## Quick Responses for Common Queries:
- Pricing: "Costs vary by project scope. Let's discuss your needs! DM us or visit matchbest.com/contact"
- Timeline: "Timelines depend on complexity. Typically 2-12 weeks. What's your project about?"
- Technologies: "We use React, Node.js, Python, AWS, AI/ML, and more cutting-edge tech!"
- Contact: "Reach us at matchbest.com/contact or keep chatting here! We're here to help 😊"

## Response Style:
- Start with acknowledgment
- Provide specific, helpful information
- End with engagement (question or CTA)
- Keep it human and conversational`;

    console.log("Generating optimized Instagram response for MatchBest...");

    // Use AI SDK with enhanced parameters
    const result = await generateText({
      model: openrouter("meta-llama/llama-3.3-70b-instruct"),
      system: fullSystemPrompt,
      prompt: `User message: "${userMessage}"\n\nProvide a helpful, engaging Instagram DM response representing MatchBest Group.`,
      maxTokens: 150, // Reduced for concise Instagram responses
      temperature: 0.8, // Slightly higher for more conversational tone
    });

    return result.text || getRandomFallbackResponse();
  } catch (error) {
    console.error("Error generating AI response:", error);
    return getRandomFallbackResponse();
  }
}

// Fallback responses for when AI fails
function getRandomFallbackResponse(): string {
  const fallbacks = [
    "Hi! I'm MatchBest AI assistant 🤖 I'm here to help with web development, AI solutions, and digital transformation! What can I help you with?",
    "Hey there! 👋 MatchBest Group specializes in cutting-edge tech solutions. Tell me about your project - web app, AI integration, or OTT platform?",
    "Hello! 😊 We build amazing digital products at MatchBest Group. Need help with development, AI automation, or cloud solutions? Let's chat!",
    "Hi! MatchBest Group here 🚀 We create world-class web apps, AI solutions, and enterprise platforms. How can we help your business grow?",
    "Hey! 💼 MatchBest Group offers complete digital transformation services. What's your business challenge? Let's solve it together!",
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
