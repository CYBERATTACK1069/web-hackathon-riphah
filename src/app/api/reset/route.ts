import { NextResponse } from "next/server";
import { resetDatabaseToSeed, getDb } from "@/lib/db";

export async function POST() {
  try {
    const freshDb = resetDatabaseToSeed();
    return NextResponse.json({
      success: true,
      message: "Database restored to demo seed state for judges",
      data: freshDb,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const current = getDb();
    return NextResponse.json({ success: true, data: current });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
