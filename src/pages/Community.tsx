import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageCircle, Heart, Share2, Plus, BarChart3, Star } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { PollCard } from "@/components/PollCard";
import { ReviewCard } from "@/components/ReviewCard";
import { useToast } from "@/hooks/use-toast";

const Community = () => {
  const { toast } = useToast();
  const [userVotes, setUserVotes] = useState<{[key: string]: string}>({});
  const [helpfulReviews, setHelpfulReviews] = useState<{[key: string]: boolean}>({});
  const groups = [
    {
      id: 1,
      name: "Local Photographers",
      description: "Share your photography and get feedback from fellow photographers in the area.",
      members: 234,
      posts: 89,
      category: "Photography",
      isJoined: true
    },
    {
      id: 2,
      name: "Food Lovers Unite",
      description: "Discover the best local restaurants and share your culinary adventures.",
      members: 567,
      posts: 234,
      category: "Food",
      isJoined: false
    },
    {
      id: 3,
      name: "Outdoor Adventures",
      description: "Plan hiking trips, outdoor activities, and explore nature together.",
      members: 189,
      posts: 156,
      category: "Outdoor",
      isJoined: true
    }
  ];

  const discussions = [
    {
      id: 1,
      title: "Best coffee shops downtown?",
      author: "Sarah M.",
      group: "Food Lovers Unite",
      replies: 23,
      likes: 45,
      timeAgo: "2h ago"
    },
    {
      id: 2,
      title: "Photography workshop this weekend",
      author: "Mike Chen",
      group: "Local Photographers",
      replies: 12,
      likes: 67,
      timeAgo: "4h ago"
    },
    {
      id: 3,
      title: "Hiking trail recommendations?",
      author: "Emma J.",
      group: "Outdoor Adventures",
      replies: 18,
      likes: 34,
      timeAgo: "6h ago"
    }
  ];

  const polls = [
    {
      id: "poll1",
      title: "Best time for community yoga sessions?",
      description: "Help us decide when to schedule our weekly outdoor yoga sessions",
      options: [
        { id: "morning", text: "Early Morning (7-9 AM)", votes: 34 },
        { id: "evening", text: "Evening (6-8 PM)", votes: 52 },
        { id: "weekend", text: "Weekend Mornings", votes: 28 }
      ],
      totalVotes: 114,
      timeRemaining: "3 days left",
      hasVoted: false
    },
    {
      id: "poll2", 
      title: "Community garden location preference?",
      description: "Where should we establish our new community garden?",
      options: [
        { id: "central", text: "Central Park Area", votes: 41 },
        { id: "riverfront", text: "Riverfront District", votes: 29 },
        { id: "north", text: "North Side Community Center", votes: 18 }
      ],
      totalVotes: 88,
      timeRemaining: "5 days left",
      hasVoted: true,
      userVote: "central"
    }
  ];

  const reviews = [
    {
      id: "review1",
      businessName: "Sunrise Coffee Roasters",
      category: "restaurant",
      rating: 5,
      reviewText: "Amazing local coffee shop! The baristas know their craft and the atmosphere is perfect for working or meeting friends. Their Ethiopian blend is exceptional.",
      author: "Lisa K.",
      timeAgo: "1 day ago",
      location: "Downtown District",
      helpful: 12,
      replies: 3,
      isHelpful: false
    },
    {
      id: "review2",
      businessName: "Green Valley Bike Repair",
      category: "service",
      rating: 4,
      reviewText: "Quick and reliable service. Fixed my bike chain in under 30 minutes. Prices are reasonable and the owner is very knowledgeable about cycling.",
      author: "Tom R.",
      timeAgo: "3 days ago", 
      location: "Green Valley",
      helpful: 8,
      replies: 1,
      isHelpful: true
    },
    {
      id: "review3",
      businessName: "Luna Art Gallery",
      category: "entertainment",
      rating: 5,
      reviewText: "Beautiful local art gallery featuring work from community artists. The current exhibition on urban landscapes is breathtaking. Highly recommend!",
      author: "Maya P.",
      timeAgo: "5 days ago",
      location: "Arts District", 
      helpful: 15,
      replies: 5,
      isHelpful: false
    }
  ];

  const handleVote = (pollId: string, optionId: string) => {
    setUserVotes(prev => ({ ...prev, [pollId]: optionId }));
    toast({
      title: "Vote Recorded!",
      description: "Thank you for participating in the community poll.",
    });
  };

  const handleMarkHelpful = (reviewId: string) => {
    setHelpfulReviews(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
    toast({
      title: helpfulReviews[reviewId] ? "Removed from helpful" : "Marked as helpful",
      description: "Your feedback helps the community.",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Community</h1>
            </div>
            <p className="text-muted-foreground">
              Connect with like-minded people in your area and join local groups.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>

        {/* My Groups */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">My Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.filter(group => group.isJoined).map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">{group.category}</Badge>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{group.members} members</span>
                      <span>{group.posts} posts</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      View Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Community Content Tabs */}
        <Tabs defaultValue="discussions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="polls" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Community Polls
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Local Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Recent Discussions</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Start Discussion
              </Button>
            </div>
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{discussion.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {discussion.author} in {discussion.group} • {discussion.timeAgo}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{discussion.replies}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{discussion.likes}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="polls" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Community Polls</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Poll
              </Button>
            </div>
            <div className="space-y-6">
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  {...poll}
                  hasVoted={poll.hasVoted || Boolean(userVotes[poll.id])}
                  userVote={poll.userVote || userVotes[poll.id]}
                  onVote={handleVote}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Local Business Reviews</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Write Review
              </Button>
            </div>
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  {...review}
                  isHelpful={helpfulReviews[review.id] || review.isHelpful}
                  onMarkHelpful={handleMarkHelpful}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Suggested Groups */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Suggested Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.filter(group => !group.isJoined).map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">{group.category}</Badge>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{group.members} members</span>
                      <span>{group.posts} posts</span>
                    </div>
                    <Button className="w-full">
                      Join Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Community;