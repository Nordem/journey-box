"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, User, Calendar, FileText, Target, RefreshCw, AlertTriangle, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// Import types and service
import { Event } from "@/types"
import { getRecommendedEvents } from "@/services/userMatchingEvents"
import Sidebar from "@/components/sidebar"

interface UserData {
  id: string
  userProfile: any
  eventPreferences: any
  restrictions: any
  history: any
  idealOutcomes: any[]
  calendarEvents: any[]
  deliverables: any[]
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [loadingRecommendedEvents, setLoadingRecommendedEvents] = useState(false)
  const [loadingAllEvents, setLoadingAllEvents] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Function to fetch all events
  const fetchAllEvents = async () => {
    try {
      setLoadingAllEvents(true);
      const response = await fetch('/api/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data.events)) {
        setAllEvents(data.events);
      } else {
        setAllEvents([]);
      }
    } catch (error) {
      setAllEvents([]);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingAllEvents(false);
    }
  };

  // Function to fetch recommended events using the service directly
  const fetchRecommendedEvents = async (userProfile: any) => {
    try {
      if (!userProfile?.userProfile) {
        setRecommendedEvents([]);
        return;
      }
      
      setLoadingRecommendedEvents(true);
      
      const recommendedEvents = await getRecommendedEvents({
        userProfile: {
          name: userProfile.userProfile.name,
          location: userProfile.userProfile.location,
          currentTravelLocation: userProfile.userProfile.currentTravelLocation || "",
          languages: userProfile.userProfile.languages || [],
          personalityTraits: userProfile.userProfile.personalityTraits || [],
          goals: userProfile.userProfile.goals || [],
          hobbiesAndInterests: userProfile.userProfile.hobbiesAndInterests || [],
          additionalInfo: userProfile.userProfile.additionalInfo || "",
          nearestAirport: userProfile.userProfile.nearestAirport || ""
        },
        eventPreferences: {
          categories: userProfile.eventPreferences?.categories || [],
          vibeKeywords: userProfile.eventPreferences?.vibeKeywords || [],
          idealTimeSlots: userProfile.eventPreferences?.idealTimeSlots || [],
          budget: userProfile.eventPreferences?.budget || "",
          preferredGroupType: userProfile.eventPreferences?.preferredGroupType || [],
          preferredEventSize: userProfile.eventPreferences?.preferredEventSize || [],
          maxDistanceKm: userProfile.eventPreferences?.maxDistanceKm || 100,
          preferredExperiences: userProfile.eventPreferences?.preferredExperiences || [],
          preferredDestinations: userProfile.eventPreferences?.preferredDestinations || [],
          seasonalPreferences: userProfile.eventPreferences?.seasonalPreferences || [],
          groupSizePreference: userProfile.eventPreferences?.groupSizePreference || [],
          blockedDates: userProfile.eventPreferences?.blockedDates || [],
          teamBuildingPrefs: userProfile.eventPreferences?.teamBuildingPrefs || {
            preferredActivities: [],
            location: "",
            duration: "",
            suggestions: []
          }
        },
        restrictions: userProfile.restrictions || {},
        calendarAvailability: userProfile.calendarEvents?.reduce((acc: any, event: any) => {
          acc[event.date] = event.status;
          return acc;
        }, {}) || {}
      });
      
      setRecommendedEvents(recommendedEvents);
      
    } catch (error) {
      setRecommendedEvents([]);
      toast({
        title: "Error",
        description: "Failed to fetch recommended events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingRecommendedEvents(false);
    }
  };

  // Function to fetch user profile data
  const fetchUserData = async (userId: string) => {
    try {
      setRefreshing(true);
      
      if (typeof window !== 'undefined' && userId) {
        try {
          const response = await fetch(`/api/user/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            if (response.status === 404) {
              setUserData(null);
              toast({
                title: "Profile Not Found",
                description: "You need to complete the registration process first.",
                variant: "destructive",
              });
            } else {
              const errorText = await response.text();
              throw new Error(`Failed to fetch user data: ${response.status} ${errorText}`);
            }
          } else {
            const data = await response.json();
            
            if (!data.userProfile) {
              setUserData(null);
              toast({
                title: "Profile Not Found",
                description: "Your profile data is incomplete. Please complete the registration process.",
                variant: "destructive",
              });
            } else {
              setUserData(data);
            }
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch your profile data. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setRefreshing(false);
    }
  };

  // Navigate to registration
  const goToRegistration = () => {
    router.push('/register');
  }

  // Check if user is logged in and fetch their data
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        if (!session.user.email_confirmed_at) {
          toast({
            title: "Email Not Verified",
            description: "Please check your email and verify your account before accessing the dashboard.",
            variant: "destructive",
          })
          return
        }

        setUser(session.user)
        await fetchUserData(session.user.id)
        await fetchAllEvents()
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  // Add effect to fetch recommended events when user data changes
  useEffect(() => {
    if (userData?.userProfile) {
      fetchRecommendedEvents(userData)
    }
  }, [userData])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleRefresh = () => {
    if (user) {
      fetchUserData(user.id)
    }
  }

  if (loading) {
    return (
      <div className="flex">
        <Sidebar 
          isAdmin={userData?.userProfile?.role === 'admin'}
          userName={userData?.userProfile?.name || 'Usuario'}
          userAvatar={userData?.userProfile?.avatar || '/placeholder.svg'}
        />
        <div className="flex-1 ml-[250px]"> {/* Adjust margin to match sidebar width */}
          <div className="container max-w-6xl py-10">
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[100px]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black">
      <Sidebar 
        isAdmin={userData?.userProfile?.role === 'admin'}
        userName={userData?.userProfile?.name || 'Usuario'}
        userAvatar={userData?.userProfile?.avatar || '/placeholder.svg'}
      />
      <main className="flex-1 overflow-auto p-8">
        <div className="container max-w-6xl py-10">
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {userData?.userProfile?.name || user?.email}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  className="flex items-center"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? "Refreshing..." : "Refresh Data"}
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>

            {!userData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Not Found</CardTitle>
                  <CardDescription>We couldn't find your profile in our database</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    You're authenticated with Supabase, but it seems you don't have a profile in our database.
                    This can happen if:
                  </p>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>You signed up but never completed the registration wizard</li>
                    <li>You created your account through Supabase directly</li>
                    <li>There was an error during the profile creation process</li>
                  </ul>
                  <p className="mb-4">
                    You need to complete the registration process to access your dashboard.
                  </p>
                  <Button 
                    onClick={goToRegistration}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Go to Registration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="recommendations">
                    <Star className="mr-2 h-4 w-4" />
                    Recommended Events
                  </TabsTrigger>
                  <TabsTrigger value="preferences">
                    <Target className="mr-2 h-4 w-4" />
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="deliverables">
                    <FileText className="mr-2 h-4 w-4" />
                    Deliverables
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  {userData?.userProfile ? (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>Your basic profile information</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Name</h3>
                              <p className="text-lg">{userData.userProfile.name}</p>
                            </div>
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Location</h3>
                              <p className="text-lg">{userData.userProfile.location}</p>
                            </div>
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Current Travel Location</h3>
                              <p className="text-lg">{userData.userProfile.currentTravelLocation || "None specified"}</p>
                            </div>
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Nearest Airport</h3>
                              <p className="text-lg">{userData.userProfile.nearestAirport || "None specified"}</p>
                            </div>
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Languages</h3>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {userData.userProfile.languages?.length > 0 ? 
                                  userData.userProfile.languages.map((lang: string, i: number) => (
                                    <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">
                                      {lang}
                                    </span>
                                  )) : 
                                  <p>None specified</p>
                                }
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium text-sm text-muted-foreground mb-1">Additional Information</h3>
                              <p className="text-lg">{userData.userProfile.additionalInfo || "None provided"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Only show Personality & Interests card if at least one of the fields has data */}
                      {(userData.userProfile.personalityTraits?.length > 0 || 
                        userData.userProfile.hobbiesAndInterests?.length > 0 || 
                        userData.userProfile.goals?.length > 0) && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Personality & Interests</CardTitle>
                            <CardDescription>Your traits, interests and objectives</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {userData.userProfile.personalityTraits?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Personality Traits</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.userProfile.personalityTraits.map((trait: string, i: number) => (
                                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                                        {trait}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {userData.userProfile.hobbiesAndInterests?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Hobbies & Interests</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.userProfile.hobbiesAndInterests.map((interest: string, i: number) => (
                                      <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">
                                        {interest}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {userData.userProfile.goals?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Goals</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.userProfile.goals.map((goal: string, i: number) => (
                                      <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                                        {goal}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Incomplete</CardTitle>
                        <CardDescription>Your profile information is not available</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>You may need to complete the registration process or reload the page.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Events</CardTitle>
                      <CardDescription>Events matched to your preferences and profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingRecommendedEvents ? (
                        <div className="space-y-4">
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      ) : recommendedEvents.length > 0 ? (
                        <div className="space-y-4">
                          {recommendedEvents.map((event, index) => (
                            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-lg">{event.name}</h3>
                                  <p className="text-sm text-muted-foreground">{event.location} • {event.date}</p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Music: {event.music.join(', ')}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {event.activities.map((activity, i) => (
                                    <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      {activity}
                                    </span>
                                  ))}
                                </div>
                                {event.matchReasons && event.matchReasons.length > 0 && (
                                  <div className="mt-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Why this event matches your profile:</h4>
                                    <ul className="space-y-1">
                                      {event.matchReasons.map((reason, i) => (
                                        <li key={i} className="text-sm text-gray-600 flex items-start">
                                          <span className="text-blue-500 mr-1">•</span>
                                          {reason}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No recommended events found at this time.</p>
                          <p className="text-sm mt-2">Try updating your preferences or check back later.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>All Events</CardTitle>
                      <CardDescription>Browse all available events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingAllEvents ? (
                        <div className="space-y-4">
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      ) : allEvents.length > 0 ? (
                        <div className="space-y-4">
                          {allEvents.map((event, index) => (
                            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-lg">{event.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {event.location} • {event.date}
                                    {event.category_name && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{event.category_name}</span>}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Music: {event.music.join(', ')}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {event.activities.map((activity, i) => (
                                    <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      {activity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No events available at this time.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                  {userData?.eventPreferences ? (
                    <>
                      {/* Travel Preferences card - only show if data exists */}
                      {(userData.eventPreferences.preferredExperiences?.length > 0 || 
                        userData.eventPreferences.preferredDestinations?.length > 0) && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Travel Preferences</CardTitle>
                            <CardDescription>Your experiences and destinations preferences</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {userData.eventPreferences.preferredExperiences?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Preferred Experiences</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.eventPreferences.preferredExperiences.map((experience: string, i: number) => (
                                      <span key={i} className="bg-teal-100 text-teal-800 px-2 py-1 rounded-md text-sm">
                                        {experience}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {userData.eventPreferences.preferredDestinations?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Preferred Destinations</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.eventPreferences.preferredDestinations.map((destination: string, i: number) => (
                                      <span key={i} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm">
                                        {destination}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Team Building Preferences card - only show if data exists */}
                      {(userData.eventPreferences.teamBuildingPrefs?.preferredActivities?.length > 0 || 
                        userData.eventPreferences.teamBuildingPrefs?.location || 
                        userData.eventPreferences.teamBuildingPrefs?.duration || 
                        userData.eventPreferences.teamBuildingPrefs?.suggestions?.length > 0) && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Team Building Preferences</CardTitle>
                            <CardDescription>Your team building preferences</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {userData.eventPreferences.teamBuildingPrefs?.preferredActivities?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Preferred Activities</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.eventPreferences.teamBuildingPrefs.preferredActivities.map((activity: string, i: number) => (
                                      <span key={i} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-sm">
                                        {activity}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {userData.eventPreferences.teamBuildingPrefs?.location && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Location Preference</h3>
                                  <p className="text-lg">
                                    <span className="capitalize">
                                      {userData.eventPreferences.teamBuildingPrefs.location.replace('_', ' ')}
                                    </span>
                                  </p>
                                </div>
                              )}
                              {userData.eventPreferences.teamBuildingPrefs?.duration && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Duration Preference</h3>
                                  <p className="text-lg">
                                    <span className="capitalize">
                                      {userData.eventPreferences.teamBuildingPrefs.duration.replace(/_/g, ' ')}
                                    </span>
                                  </p>
                                </div>
                              )}
                              {userData.eventPreferences.teamBuildingPrefs?.suggestions?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Additional Suggestions</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.eventPreferences.teamBuildingPrefs.suggestions.map((suggestion: string, i: number) => (
                                      <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">
                                        {suggestion}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Seasonal & Availability Preferences card - only show if data exists */}
                      {(userData.eventPreferences.seasonalPreferences?.length > 0 || 
                        userData.eventPreferences.groupSizePreference?.length > 0 || 
                        userData.eventPreferences.blockedDates?.length > 0) && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Seasonal & Availability Preferences</CardTitle>
                            <CardDescription>Your time and seasonal preferences</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {userData.eventPreferences.seasonalPreferences?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Seasonal Preferences</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.eventPreferences.seasonalPreferences.map((season: string, i: number) => (
                                      <span key={i} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm">
                                        {season}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {userData.eventPreferences.groupSizePreference?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Group Size Preference</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.eventPreferences.groupSizePreference.map((size: string, i: number) => (
                                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                                        {size}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {userData.eventPreferences.blockedDates?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Blocked Dates</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.eventPreferences.blockedDates.map((date: string, i: number) => (
                                      <span key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm">
                                        {date}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Event Category Preferences card - only show if data exists */}
                      {(userData.eventPreferences.categories?.length > 0 || 
                        userData.eventPreferences.vibeKeywords?.length > 0 || 
                        userData.eventPreferences.budget) && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Event Category Preferences</CardTitle>
                            <CardDescription>Your preferred categories and vibes</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {userData.eventPreferences.categories?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Preferred Categories</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.eventPreferences.categories.map((category: string, i: number) => (
                                      <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                                        {category}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {userData.eventPreferences.vibeKeywords?.length > 0 && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Vibe Keywords</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {userData.eventPreferences.vibeKeywords.map((keyword: string, i: number) => (
                                      <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {userData.eventPreferences.budget && (
                                <div>
                                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Budget</h3>
                                  <p className="text-lg capitalize">{userData.eventPreferences.budget}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Restrictions card - only show if data exists and has at least one enabled restriction */}
                      {userData?.restrictions && 
                        (userData.restrictions.avoidCrowdedDaytimeConferences || 
                         userData.restrictions.avoidOverlyFormalNetworking || 
                         userData.restrictions.avoidFamilyKidsEvents) && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Restrictions</CardTitle>
                            <CardDescription>Your event restrictions</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 gap-4">
                              {userData.restrictions.avoidCrowdedDaytimeConferences && (
                                <div className="flex items-start">
                                  <div className="w-4 h-4 mt-1 mr-2 rounded-full bg-red-500"></div>
                                  <div>
                                    <h3 className="font-medium">Avoid Crowded Daytime Conferences</h3>
                                    <p className="text-sm text-muted-foreground">Yes</p>
                                  </div>
                                </div>
                              )}
                              {userData.restrictions.avoidOverlyFormalNetworking && (
                                <div className="flex items-start">
                                  <div className="w-4 h-4 mt-1 mr-2 rounded-full bg-red-500"></div>
                                  <div>
                                    <h3 className="font-medium">Avoid Overly Formal Networking</h3>
                                    <p className="text-sm text-muted-foreground">Yes</p>
                                  </div>
                                </div>
                              )}
                              {userData.restrictions.avoidFamilyKidsEvents && (
                                <div className="flex items-start">
                                  <div className="w-4 h-4 mt-1 mr-2 rounded-full bg-red-500"></div>
                                  <div>
                                    <h3 className="font-medium">Avoid Family/Kids Events</h3>
                                    <p className="text-sm text-muted-foreground">Yes</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Show an empty state if no preferences are set */}
                      {!(userData.eventPreferences.preferredExperiences?.length > 0 || 
                         userData.eventPreferences.preferredDestinations?.length > 0 ||
                         userData.eventPreferences.teamBuildingPrefs?.preferredActivities?.length > 0 || 
                         userData.eventPreferences.teamBuildingPrefs?.location || 
                         userData.eventPreferences.teamBuildingPrefs?.duration || 
                         userData.eventPreferences.teamBuildingPrefs?.suggestions?.length > 0 ||
                         userData.eventPreferences.seasonalPreferences?.length > 0 || 
                         userData.eventPreferences.groupSizePreference?.length > 0 || 
                         userData.eventPreferences.blockedDates?.length > 0 ||
                         userData.eventPreferences.categories?.length > 0 || 
                         userData.eventPreferences.vibeKeywords?.length > 0 || 
                         userData.eventPreferences.budget ||
                         userData.restrictions?.avoidCrowdedDaytimeConferences || 
                         userData.restrictions?.avoidOverlyFormalNetworking || 
                         userData.restrictions?.avoidFamilyKidsEvents) && (
                        <Card>
                          <CardHeader>
                            <CardTitle>No Preferences Set</CardTitle>
                            <CardDescription>You haven't set any preferences yet</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>You can set your preferences by completing the registration process.</p>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Preferences Not Available</CardTitle>
                        <CardDescription>Your preference information is not available</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>You may need to complete the registration process.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="calendar" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Calendar Events</CardTitle>
                      <CardDescription>Your scheduled events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userData?.calendarEvents && userData.calendarEvents.length > 0 ? (
                        <div className="space-y-4">
                          {userData.calendarEvents.map((event: any, i: number) => (
                            <div key={i} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{new Date(event.date).toLocaleDateString()}</h3>
                                  <p className="text-sm text-muted-foreground">Status: {event.status}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  event.status === 'Free' ? 'bg-green-100 text-green-800' : 
                                  event.status === 'Booked' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {event.status}
                                </span>
                              </div>
                              {event.description && (
                                <p className="mt-2">{event.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No calendar events available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="deliverables" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deliverables</CardTitle>
                      <CardDescription>Your goals and commitments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userData?.deliverables && userData.deliverables.length > 0 ? (
                        <div className="space-y-4">
                          {userData.deliverables.map((deliverable: any, i: number) => (
                            <div key={i} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium">{deliverable.title}</h3>
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  {new Date(deliverable.date).toLocaleDateString()}
                                </span>
                              </div>
                              {deliverable.note && (
                                <p className="mt-2 text-sm">{deliverable.note}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No deliverables available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 