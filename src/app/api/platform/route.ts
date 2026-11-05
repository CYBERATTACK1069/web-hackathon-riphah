import { NextResponse } from "next/server";
import { getDatabase, resetToInitialDemoData } from "@/lib/store";

export async function GET() {
  try {
    const db = await getDatabase();
    return NextResponse.json({ success: true, data: db });
  } catch (error) {
    console.error("Failed to load platform data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve platform data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "reset") {
      const freshDb = await resetToInitialDemoData();
      return NextResponse.json({ success: true, data: freshDb });
    }
    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to execute platform action:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

