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
  startDate: string;
  endDate: string;
  activities: string[];
  highlights: string[];
  maxParticipants: number;
  originalPrice: number;
  finalPrice: number;
  isHighlight: boolean;
  location?: string;
}

export interface UserProfile {
  userProfile: {
    name: string;
    location: string;
    currentTravelLocation: string;
    languages: string[];
    personalityTraits: string[];
    goals: string[];
    hobbiesAndInterests: string[];
    additionalInfo: string;
    nearestAirport: string;
    role?: string;
    avatar?: string;
  };
  eventPreferences: {
    categories: string[];
    vibeKeywords: string[];
    idealTimeSlots: string[];
    budget: string;
    preferredGroupType: string[];
    preferredEventSize: string[];
    maxDistanceKm: number;
    preferredExperiences: string[];
    preferredDestinations: string[];
    seasonalPreferences: string[];
    groupSizePreference: string[];
    blockedDates: string[];
    teamBuildingPrefs?: {
      preferredActivities: string[];
      location: string;
      duration: string;
      suggestions: string[];
    };
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
        model: "gpt-4",
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
Location: ${event.city}, ${event.state || event.country}
Dates: ${event.startDate} - ${event.endDate}
Category: ${event.category}
Description: ${event.description}
Highlights: ${event.highlights.join(", ")}
Activities: ${event.activities.join(", ")}
Max Participants: ${event.maxParticipants}
Price: ${event.originalPrice} MXN (${event.finalPrice} MXN final)
---`).join("\n");

    const prompt = `Analyze these events and determine which ones are good matches for the user based on their profile and preferences. Be very selective and only recommend events that truly match the user's preferences.

Available Events:
${eventsList}

User Profile:
- Name: ${userProfile.userProfile.name || "Not specified"}
- Location: ${userProfile.userProfile.location || "Not specified"}
- Current Travel Location: ${userProfile.userProfile.currentTravelLocation || "Not specified"}
- Languages: ${userProfile.userProfile.languages?.join(", ") || "Not specified"}
- Personality Traits: ${userProfile.userProfile.personalityTraits?.join(", ") || "Not specified"}
- Hobbies and Interests: ${userProfile.userProfile.hobbiesAndInterests?.join(", ") || "Not specified"}
- Goals: ${userProfile.userProfile.goals?.join(", ") || "Not specified"}
- Additional Info: ${userProfile.userProfile.additionalInfo || "None"}
- Nearest Airport: ${userProfile.userProfile.nearestAirport || "Not specified"}

Event Preferences:
- Preferred Experiences: ${userProfile.eventPreferences.preferredExperiences?.join(", ") || "Not specified"}
- Preferred Destinations: ${userProfile.eventPreferences.preferredDestinations?.join(", ") || "Not specified"}
- Seasonal Preferences: ${userProfile.eventPreferences.seasonalPreferences?.join(", ") || "Not specified"}
- Group Size Preference: ${userProfile.eventPreferences.groupSizePreference?.join(", ") || "Not specified"}
- Blocked Dates: ${userProfile.eventPreferences.blockedDates?.join(", ") || "None"}
- Categories: ${userProfile.eventPreferences.categories?.join(", ") || "Not specified"}
- Vibe Keywords: ${userProfile.eventPreferences.vibeKeywords?.join(", ") || "Not specified"}
- Budget: ${userProfile.eventPreferences.budget || "Not specified"}

Team Building Preferences:
- Preferred Activities: ${userProfile.eventPreferences.teamBuildingPrefs?.preferredActivities?.join(", ") || "None"}
- Location Preference: ${userProfile.eventPreferences.teamBuildingPrefs?.location || "Not specified"}
- Duration Preference: ${userProfile.eventPreferences.teamBuildingPrefs?.duration || "Not specified"}
- Additional Suggestions: ${userProfile.eventPreferences.teamBuildingPrefs?.suggestions?.join(", ") || "None"}

Other Information:
- Calendar Availability: ${userProfile.calendarAvailability ? Object.entries(userProfile.calendarAvailability).map(([date, status]) => `${date}: ${status}`).join(", ") : "None"}

For each event, provide a match score (0-100) and specific reasons why it matches or doesn't match. Only recommend events that:
1. Match at least 3 key preferences
2. Don't violate any restrictions
3. Have a match score of 75 or higher
4. Are within the user's budget range
5. Match the user's preferred group size

Format your response as JSON: { "matches": [{ "eventName": string, "isMatch": boolean, "score": number, "reasons": string[] }] }`;

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
              if (match.isMatch && match.score >= 75) {
                const event = events.find((e: Event) => e.name === match.eventName);
                if (event) {
                  // Additional validation
                  const isWithinBudget = validateBudget(event, userProfile.eventPreferences.budget);
                  const matchesGroupSize = validateGroupSize(event, userProfile.eventPreferences.groupSizePreference);
                  const matchesRestrictions = validateRestrictions(event, userProfile.restrictions);
                  
                  if (isWithinBudget && matchesGroupSize && matchesRestrictions) {
                    recommendedEvents.push({
                      ...event,
                      matchScore: match.score,
                      matchReasons: match.reasons
                    });
                  }
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
      // If OpenAI API fails, implement a more sophisticated fallback mechanism
      console.warn("OpenAI API unavailable, falling back to advanced recommendations");
      events.forEach((event: Event) => {
        const score = calculateMatchScore(event, userProfile);
        if (score >= 75) {
          recommendedEvents.push({
            ...event,
            matchScore: score,
            matchReasons: generateMatchReasons(event, userProfile)
          });
        }
      });
    }

    // Sort by match score and limit to top 5 recommendations
    return recommendedEvents
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  } catch (error) {
    console.error("Error in getRecommendedEvents:", error);
    return [];
  }
}

function validateBudget(event: Event, budgetPreference: string | undefined): boolean {
  if (!budgetPreference || !event.finalPrice) return true;
  
  const price = event.finalPrice;
  switch (budgetPreference.toLowerCase()) {
    case 'low':
      return price <= 1000;
    case 'medium':
      return price > 1000 && price <= 3000;
    case 'high':
      return price > 3000;
    default:
      return true;
  }
}

function validateGroupSize(event: Event, groupSizePreference: string[] | undefined): boolean {
  if (!groupSizePreference || !event.maxParticipants) return true;
  
  const maxParticipants = event.maxParticipants;
  return groupSizePreference.some(pref => {
    switch (pref.toLowerCase()) {
      case 'individual':
        return maxParticipants <= 2;
      case 'small group':
        return maxParticipants > 2 && maxParticipants <= 10;
      case 'large group':
        return maxParticipants > 10;
      default:
        return true;
    }
  });
}

function validateRestrictions(event: Event, restrictions: any | undefined): boolean {
  if (!restrictions) return true;
  
  const eventName = event.name.toLowerCase();
  const eventDescription = event.description.toLowerCase();
  
  if (restrictions.avoidCrowdedDaytimeConferences) {
    if (eventName.includes('conference') || eventDescription.includes('conference')) {
      return false;
    }
  }
  
  if (restrictions.avoidOverlyFormalNetworking) {
    if (eventName.includes('networking') || eventDescription.includes('networking')) {
      return false;
    }
  }
  
  if (restrictions.avoidFamilyKidsEvents) {
    if (eventName.includes('family') || eventName.includes('kids') || 
        eventDescription.includes('family') || eventDescription.includes('kids')) {
      return false;
    }
  }
  
  return true;
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

  // Group size match
  if (validateGroupSize(event, userProfile.eventPreferences.groupSizePreference)) {
    score += weights.groupSize;
  }

  // Budget match
  if (validateBudget(event, userProfile.eventPreferences.budget)) {
    score += weights.budget;
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

  if (validateGroupSize(event, userProfile.eventPreferences.groupSizePreference)) {
    reasons.push(`Group size matches user preferences`);
  }

  if (validateBudget(event, userProfile.eventPreferences.budget)) {
    reasons.push(`Price is within user's budget range`);
  }

  return reasons;
}
