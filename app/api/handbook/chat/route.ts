import { NextRequest, NextResponse } from "next/server";
import {
  getAIResponse,
  parseStringContext,
  type ChatMessageIn,
  type ChatContext,
  type ChatApiResponse,
} from "@/lib/handbook/chat-api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessageIn[] = body.messages ?? [];
    const rawContext = body.context;

    let context: ChatContext;
    if (typeof rawContext === "string") {
      context = parseStringContext(rawContext);
    } else if (rawContext && typeof rawContext === "object") {
      context = rawContext as ChatContext;
    } else {
      context = { mode: "explore" };
    }

    if (body.session_intent && !context.session_intent) {
      context.session_intent = body.session_intent;
    }

    const response: ChatApiResponse = await getAIResponse(messages, context);
    return NextResponse.json(response);
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      {
        message: "An error occurred. Please try again.",
        text: "An error occurred. Please try again.",
        retrieval_mode: "fallback",
      },
      { status: 500 }
    );
  }
}
