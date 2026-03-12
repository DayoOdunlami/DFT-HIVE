import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, user_note } = body as { url?: string; user_note?: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required." },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Please enter a valid URL." },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.HIVE_SUPABASE_URL ??
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.HIVE_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Service unavailable — please try again later." },
        { status: 503 }
      );
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "hive" },
    });

    const { error } = await supabase.from("source_candidates").insert({
      url,
      user_note: user_note || null,
      suggested_by: "user",
      status: "pending",
      title: null,
    });

    if (error) {
      console.error("[suggest-source] Insert error:", error);
      return NextResponse.json(
        { error: "Failed to save suggestion. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[suggest-source] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
