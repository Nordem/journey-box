// Types for the application

export interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  music: string[];
  activities: string[];
  category_id?: string;
  category_name?: string;
}

export interface Collaborator {
  userProfile: {
    name: string;
    location: string;
    currentTravelLocation: string;
    languages: string[];
    personalityTraits: string[];
    goals: string[];
  };
  eventPreferences: {
    categories: string[];
    vibeKeywords: string[];
    idealTimeSlots: string[];
    budget: string;
    preferredGroupType: string[];
    preferredEventSize: string[];
    maxDistanceKm: number;
  };
  restrictions: {
    avoidCrowdedDaytimeConferences: boolean;
    avoidOverlyFormalNetworking: boolean;
  };
  history: {
    recentEventsAttended: string[];
    eventFeedback: Record<string, string>;
  };
  idealOutcomes: string[];
  calendarAvailability: Record<string, string>;
  deliverables: Array<{
    title: string;
    date: string;
    note: string;
  }>;
} 