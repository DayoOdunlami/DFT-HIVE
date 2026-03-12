import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
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
        { error: "Supabase credentials not configured." },
        { status: 503 }
      );
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "hive" },
    });

    const { data, error } = await supabase
      .from("source_candidates")
      .select("*")
      .order("suggested_at", { ascending: false });

    if (error) {
      console.error("[admin/source-candidates] Query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rows: data ?? [] });
  } catch (err) {
    console.error("[admin/source-candidates] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
