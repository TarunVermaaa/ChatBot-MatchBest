import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log("Updating inquiry in CRM:", params.id, body);

    const resp = await fetch(
      `${process.env.CRM_URL}/api/chatbot-leads/${params.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-crm-api-key": process.env.CRM_WEBHOOK_KEY || "",
        },
        body: JSON.stringify(body),
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      console.error("CRM update failed:", text);
      return NextResponse.json(
        { error: "Failed to update inquiry", details: text },
        { status: 502 }
      );
    }

    const data = await resp.json();

    return NextResponse.json({
      success: true,
      inquiry: data,
      message: "Inquiry updated successfully!",
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Deleting inquiry in CRM:", params.id);

    const resp = await fetch(
      `${process.env.CRM_URL}/api/chatbot-leads/${params.id}`,
      {
        method: "DELETE",
        headers: {
          "x-crm-api-key": process.env.CRM_WEBHOOK_KEY || "",
        },
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      console.error("CRM delete failed:", text);
      return NextResponse.json(
        { error: "Failed to delete inquiry", details: text },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully from CRM!",
    });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
