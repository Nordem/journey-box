import { NextResponse } from "next/server";
import { getRecommendedEvents } from "@/services/userMatchingEvents";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userProfile } = body;
    
    console.log("Received recommendation request for user:", userProfile?.userProfile?.name);
    
    if (!userProfile) {
      console.error("No user profile provided");
      return NextResponse.json(
        { error: "User profile data is required" },
        { status: 400 }
      );
    }
    
    // Get recommended events using our service
    const recommendedEvents = await getRecommendedEvents(userProfile);
    
    console.log(`Found ${recommendedEvents.length} recommended events`);
    return NextResponse.json({ events: recommendedEvents });
  } catch (error) {
    console.error("Error in recommendations API:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
} 