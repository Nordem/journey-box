import axios from "axios";

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface Event {
  id: string;
  name: string;
  category: string;
  city: string;
  state?: string;
  country: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  activities: string[];
  highlights: string[];
  maxParticipants: number;
  originalPrice: number;
  finalPrice: number;
  isHighlight: boolean;
  location?: string;
  tripManager?: string;
}

export interface UserProfile {
  userProfile: {
    name: string;
    location: string;
    currentTravelLocation?: string;
    languages: string[];
    personalityTraits: string[];
    hobbiesAndInterests: string[];
    additionalInfo?: string;
    nearestAirport?: string;
    goals: string[];
  };
  eventPreferences: {
    preferredExperiences: string[];
    preferredDestinations: string[];
    teamBuildingPrefs?: {
      preferredActivities: string[];
      location: 'office' | 'outside' | 'both';
      duration: 'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days';
      suggestions?: string;
    };
    seasonalPreferences: string[];
    groupSizePreference: string[];
    blockedDates: string[];
    categories: string[];
    vibeKeywords: string[];
    budget: string;
  };
  restrictions?: {
    avoidCrowdedDaytimeConferences: boolean;
    avoidOverlyFormalNetworking: boolean;
    avoidFamilyKidsEvents: boolean;
  };
  calendarAvailability?: Record<string, string>;
}

export interface RecommendedEvent extends Event {
  matchScore: number;
  matchReasons: string[];
}

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function makeOpenAIRequest(prompt: string, retryCount = 0): Promise<OpenAIResponse> {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are an expert event matcher AI. Your task is to analyze multiple events and determine which ones match a user's profile and preferences. Consider all aspects of the user's profile and the event details to make comprehensive match assessments. Respond with JSON only." 
          },
          { 
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 4000
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      
      // Handle quota exceeded error
      if (error.response?.status === 429 && errorMessage.includes("quota")) {
        throw new Error("OpenAI API quota exceeded. Please check your billing details or contact support.");
      }
      
      // Handle rate limiting
      if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeOpenAIRequest(prompt, retryCount + 1);
      }
      
      throw new Error(`OpenAI API error: ${error.response?.status} - ${errorMessage}`);
    }
    throw error;
  }
}

export async function getRecommendedEvents(userProfile: UserProfile): Promise<RecommendedEvent[]> {
  try {
    const eventsResponse = await fetch('/api/events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!eventsResponse.ok) {
      throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
    }
    
    const eventsData = await eventsResponse.json();
    const events = eventsData.events;
    
    if (!events || events.length === 0) {
      console.log("No events found in database");
      return [];
    }

    console.log(`Found ${events.length} events to analyze`);
    const recommendedEvents: RecommendedEvent[] = [];

    // Format events list with more details
    const eventsList = events.map((event: Event) => `
Event: ${event.name}
Location: ${event.city}, ${event.state || ''}, ${event.country}
Dates: ${event.startDate} - ${event.endDate}
Description: ${event.description}
Highlights: ${event.highlights?.join(", ") || "None"}
Is Highlight: ${event.isHighlight ? "Yes" : "No"}
Original Price: ${event.originalPrice || "Not specified"}
Final Price: ${event.finalPrice || "Not specified"}
---`).join("\n");

    const prompt = `As a travel guru, your task is to analyze the following events and match them with the user's profile. Your goal is to find the best matches based on the user's preferences and the event details.

User Profile:
- Location: ${userProfile.userProfile.location || "Not specified"}
- Nearest Airport: ${userProfile.userProfile.nearestAirport || "Not specified"}
- Personality Traits: ${userProfile.userProfile.personalityTraits?.join(", ") || "Not specified"}
- Hobbies and Interests: ${userProfile.userProfile.hobbiesAndInterests?.join(", ") || "Not specified"}
- Preferred Experiences: ${userProfile.eventPreferences.preferredExperiences?.join(", ") || "Not specified"}
- Preferred Destinations: ${userProfile.eventPreferences.preferredDestinations?.join(", ") || "Not specified"}
- Seasonal Preferences: ${userProfile.eventPreferences.seasonalPreferences?.join(", ") || "Not specified"}
- Blocked Dates: ${userProfile.eventPreferences.blockedDates?.join(", ") || "No blocked dates"}

Available Events:
${eventsList}

For each event, analyze how well it matches the user's profile and provide:
1. A match score (0-100) based on:
   - Location compatibility (20 points)
   - Experience match (20 points)
   - Destination type match (20 points)
   - Personality fit (20 points)
   - Price and accessibility (20 points)

2. Specific reasons in Spanish explaining why it matches or doesn't match

3. Whether it's a recommended event (isMatch: true/false)

Scoring Guidelines:
- Give points for any matching aspect, even if it's not a perfect match
- Consider partial matches (e.g., if an event matches 2 out of 3 preferred experiences, give partial points)
- Don't penalize too heavily for non-matching aspects
- Consider the overall value of the event, not just individual criteria

Format your response as JSON:
{
  "matches": [
    {
      "eventName": "Event Name",
      "isMatch": true/false,
      "score": number (0-100),
      "reasons": [
        "Reason 1 in Spanish",
        "Reason 2 in Spanish"
      ]
    }
  ]
}

IMPORTANT:
- Consider events with a score of 40 or higher as potential matches
- All reasons must be written in Spanish
- Focus on positive matches rather than negative ones
- Consider the user's personality traits and interests
- Take into account the user's preferred experiences and destinations
- Don't be too strict with the scoring - partial matches are acceptable`;

    console.log('=== OpenAI Prompt Content ===');
    console.log(prompt);
    console.log('=== End of Prompt ===');

    try {
      const openaiData = await makeOpenAIRequest(prompt);

      if (openaiData.choices && openaiData.choices.length > 0) {
        const content = openaiData.choices[0].message.content.trim();
        try {
          // Clean the response to ensure it's valid JSON
          const cleanContent = content.replace(/^[^{]*({.*})[^}]*$/, '$1');
          const matchResults = JSON.parse(cleanContent);
          
          if (matchResults.matches) {
            matchResults.matches.forEach((match: any) => {
              if (match.isMatch && match.score >= 40) {
                const event = events.find((e: Event) => e.name === match.eventName);
                if (event) {
                  recommendedEvents.push({
                    ...event,
                    matchScore: match.score,
                    matchReasons: match.reasons
                  });
                }
              }
            });
          }
        } catch (parseError) {
          console.error("Error parsing OpenAI response:", parseError);
          console.error("Raw response:", content);
        }
      }
    } catch (error) {
      console.error("OpenAI API error:", error);
      // If OpenAI API fails, implement a more sophisticated fallback mechanism
      console.warn("OpenAI API unavailable, falling back to advanced recommendations");
      events.forEach((event: Event) => {
        const score = calculateMatchScore(event, userProfile);
        if (score >= 40) {
          recommendedEvents.push({
            ...event,
            matchScore: score,
            matchReasons: generateMatchReasons(event, userProfile)
          });
        }
      });
    }

    // Sort by match score and limit to top 5 recommendations
    const sortedEvents = recommendedEvents
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
    
    console.log('Final recommended events:', sortedEvents);
    return sortedEvents;
  } catch (error) {
    console.error("Error in getRecommendedEvents:", error);
    return [];
  }
}

function calculateMatchScore(event: Event, userProfile: UserProfile): number {
  let score = 0;
  const maxScore = 100;
  const weights = {
    category: 20,
    activities: 20,
    location: 15,
    groupSize: 15,
    budget: 10,
    preferences: 20
  };

  // Category match
  if (userProfile.eventPreferences.categories?.includes(event.category)) {
    score += weights.category;
  }

  // Activities match
  const matchingActivities = event.activities.filter(activity => 
    userProfile.eventPreferences.preferredExperiences?.includes(activity)
  ).length;
  score += (matchingActivities / event.activities.length) * weights.activities;

  // Location match
  if (userProfile.eventPreferences.preferredDestinations?.some(dest => 
    event.location?.toLowerCase().includes(dest.toLowerCase())
  )) {
    score += weights.location;
  }


  // Additional preferences match
  const matchingPreferences = [
    ...(userProfile.eventPreferences.vibeKeywords || []),
    ...(userProfile.eventPreferences.seasonalPreferences || [])
  ].filter(pref => 
    event.description.toLowerCase().includes(pref.toLowerCase()) ||
    event.highlights.some(h => h.toLowerCase().includes(pref.toLowerCase()))
  ).length;

  score += (matchingPreferences / 5) * weights.preferences;

  return Math.min(score, maxScore);
}

function generateMatchReasons(event: Event, userProfile: UserProfile): string[] {
  const reasons: string[] = [];

  if (userProfile.eventPreferences.categories?.includes(event.category)) {
    reasons.push(`Category matches user preferences: ${event.category}`);
  }

  const matchingActivities = event.activities.filter(activity => 
    userProfile.eventPreferences.preferredExperiences?.includes(activity)
  );
  if (matchingActivities.length > 0) {
    reasons.push(`Activities match user preferences: ${matchingActivities.join(", ")}`);
  }

  if (userProfile.eventPreferences.preferredDestinations?.some(dest => 
    event.location?.toLowerCase().includes(dest.toLowerCase())
  )) {
    reasons.push(`Location matches preferred destinations`);
  }

  return reasons;
}
