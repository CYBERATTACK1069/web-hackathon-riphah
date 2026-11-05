import { NextResponse } from "next/server";
import { getCandidates } from "@/lib/db";
import { searchTalentSemantic } from "@/lib/vector";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ success: true, results: [] });
    }

    const candidates = getCandidates();
    const results = searchTalentSemantic(query, candidates);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
