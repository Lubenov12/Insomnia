import { NextRequest, NextResponse } from "next/server";

// Favorites API endpoint - placeholder for future implementation
export async function GET(_request: NextRequest) {
  try {
    // TODO: Implement favorites retrieval
    return NextResponse.json({
      message: "Favorites endpoint - coming soon",
    });
  } catch {
    return NextResponse.json(
      { error: "Favorites retrieval error" },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    // TODO: Implement add to favorites
    return NextResponse.json({
      message: "Add to favorites - coming soon",
    });
  } catch {
    return NextResponse.json(
      { error: "Add to favorites error" },
      { status: 500 }
    );
  }
}
