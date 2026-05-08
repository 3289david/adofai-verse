import { NextRequest, NextResponse } from "next/server";
import { getAICoachResponse } from "@/lib/pollinations";

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const response = await getAICoachResponse(message, context);
    return NextResponse.json({ response });
  } catch (err) {
    console.error("AI coach error:", err);
    return NextResponse.json(
      { response: "Sorry, I'm having trouble connecting right now. Please try again in a moment." },
      { status: 200 }
    );
  }
}
