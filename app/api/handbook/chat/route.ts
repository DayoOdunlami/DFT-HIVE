import { NextRequest, NextResponse } from "next/server";
import { getAIResponse, type ChatMessageIn } from "@/lib/handbook/chat-api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessageIn[] = body.messages ?? [];
    const context: string = body.context ?? "browse";

    const response = await getAIResponse(messages, context);
    return NextResponse.json(response);
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { text: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
