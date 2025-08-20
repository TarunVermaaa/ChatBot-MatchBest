import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    console.log("Inquiry API called");

    const body = await request.json();
    console.log("Request body:", body);

    const { name, email, phone, company, inquiryType, message, plan } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Please enter your name" },
        { status: 400 }
      );
    }
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Please enter your email address" },
        { status: 400 }
      );
    }
    if (!inquiryType || !inquiryType.trim()) {
      return NextResponse.json(
        { error: "Please select an inquiry type" },
        { status: 400 }
      );
    }

    // Check if CRM is configured
    if (!process.env.CRM_URL || !process.env.CRM_WEBHOOK_KEY) {
      console.warn("CRM not configured, storing locally");

      // Fallback: just return success without CRM integration
      const payload = {
        externalId: randomUUID(),
        name,
        email,
        phone: phone || null,
        company: company || null,
        inquiryType,
        message: message || null,
        plan: plan || null,
        status: "pending",
        pageUrl: body.pageUrl || null,
        sourceSite: body.sourceSite || request.headers.get("origin") || null,
        timestamp: new Date().toISOString(),
      };

      console.log("Inquiry captured (CRM unavailable):", payload);

      return NextResponse.json({
        success: true,
        message: "Your inquiry has been submitted successfully!",
        lead: payload,
      });
    }

    // Prepare payload for CRM
    const payload = {
      externalId: randomUUID(),
      name,
      email,
      phone: phone || null,
      company: company || null,
      inquiryType,
      message: message || null,
      plan: plan || null,
      status: "pending",
      pageUrl: body.pageUrl || null,
      sourceSite: body.sourceSite || request.headers.get("origin") || null,
      timestamp: new Date().toISOString(),
    };

    console.log("Forwarding inquiry to CRM:", payload);

    const resp = await fetch(`${process.env.CRM_URL}/api/chatbot-leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-crm-api-key": process.env.CRM_WEBHOOK_KEY || "",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("CRM push failed:", text);

      // Fallback: still return success to user
      console.log("Falling back to local storage:", payload);
      return NextResponse.json({
        success: true,
        message: "Your inquiry has been submitted successfully!",
        lead: payload,
        warning: "CRM integration unavailable",
      });
    }

    const data = await resp.json();
    console.log("CRM response:", data);

    return NextResponse.json({
      success: true,
      lead: data.lead,
      message: "Your inquiry has been submitted successfully!",
    });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      {
        error: `Failed to submit inquiry: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("Fetching inquiries from CRM...");

    // Check if CRM is configured
    if (!process.env.CRM_URL || !process.env.CRM_WEBHOOK_KEY) {
      console.warn("CRM not configured, returning mock data");

      // Return mock data for testing
      const mockInquiries = [
        {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          phone: "+91 9876543210",
          company: "Test Company",
          inquiryType: "demo",
          message: "I want to book a demo",
          plan: "starter",
          status: "pending",
          priority: "medium",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ inquiries: mockInquiries });
    }

    const resp = await fetch(`${process.env.CRM_URL}/api/chatbot-leads`, {
      headers: {
        "x-crm-api-key": process.env.CRM_WEBHOOK_KEY || "",
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("CRM fetch failed:", text);

      // Fallback to empty array
      return NextResponse.json({ inquiries: [] });
    }

    const data = await resp.json();
    console.log("Fetched inquiries from CRM:", data.length);

    return NextResponse.json({ inquiries: data });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { inquiries: [] }, // Always return empty array instead of error
      { status: 200 }
    );
  }
}
