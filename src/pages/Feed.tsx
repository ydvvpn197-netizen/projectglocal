import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Share, MapPin, Clock, Users, Star, Calendar } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";

const Feed = () => {
  const posts = [
    {
      id: 1,
      type: "event",
      author: "Local Events Team",
      avatar: "LE",
      time: "2 hours ago",
      title: "Jazz Night at Downtown Cafe",
      content: "Join us for an evening of smooth jazz and great coffee. Local artists will be performing original compositions.",
      location: "Downtown Cafe, 2.5 km away",
      eventDate: "Tonight, 8 PM",
      likes: 24,
      comments: 8,
      tags: ["Music", "Jazz", "Coffee"]
    },
    {
      id: 2,
      type: "artist",
      author: "Sarah Johnson",
      avatar: "SJ",
      time: "4 hours ago",
      title: "Available for Portrait Sessions",
      content: "Professional photographer offering outdoor portrait sessions this weekend. Special rates for families and couples!",
      location: "City Park Area, 1.8 km away",
      price: "$150/session",
      rating: 4.8,
      likes: 18,
      comments: 12,
      tags: ["Photography", "Portraits", "Outdoors"]
    },
    {
      id: 3,
      type: "discussion",
      author: "Community Board",
      avatar: "CB",
      time: "6 hours ago",
      title: "New Park Development Discussion",
      content: "The city is planning a new community park. Share your thoughts on what amenities you'd like to see included.",
      location: "Riverside District",
      groupMembers: 156,
      likes: 45,
      comments: 23,
      tags: ["Community", "Parks", "Development"]
    },
    {
      id: 4,
      type: "user_post",
      author: "Mike Chen",
      avatar: "MC",
      time: "8 hours ago",
      title: "Amazing street art discovered!",
      content: "Found this incredible mural during my morning walk. The local art scene is really thriving! 🎨",
      location: "Arts District, 3.2 km away",
      likes: 67,
      comments: 15,
      tags: ["Art", "Street Art", "Local Culture"]
    }
  ];

  const PostCard = ({ post }: { post: any }) => (
    <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {post.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{post.author}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {post.time}
                {post.location && (
                  <>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    {post.location}
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge variant={
            post.type === "event" ? "default" : 
            post.type === "artist" ? "secondary" :
            post.type === "discussion" ? "outline" : "secondary"
          }>
            {post.type === "event" ? "Event" : 
             post.type === "artist" ? "Artist" :
             post.type === "discussion" ? "Discussion" : "Post"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
          <p className="text-muted-foreground">{post.content}</p>
        </div>

        {/* Event specific info */}
        {post.type === "event" && post.eventDate && (
          <div className="flex items-center gap-2 text-sm bg-primary/5 p-3 rounded-lg">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">{post.eventDate}</span>
          </div>
        )}

        {/* Artist specific info */}
        {post.type === "artist" && (
          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{post.rating}</span>
            </div>
            <span className="text-sm font-medium text-primary">{post.price}</span>
          </div>
        )}

        {/* Discussion specific info */}
        {post.type === "discussion" && post.groupMembers && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{post.groupMembers} members in this discussion</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              {post.likes}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              {post.comments}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share className="h-4 w-4" />
              Share
            </Button>
          </div>
          
          {post.type === "event" && (
            <Button size="sm">Interested</Button>
          )}
          {post.type === "artist" && (
            <Button size="sm">Book Now</Button>
          )}
          {post.type === "discussion" && (
            <Button size="sm" variant="outline">Join</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto p-6">
        {/* Feed Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Your Local Feed</h1>
          <p className="text-muted-foreground">Discover what's happening in your community</p>
        </div>

        {/* Feed Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-0">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="space-y-0">
              {posts.filter(post => post.type === "event").map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="artists" className="mt-6">
            <div className="space-y-0">
              {posts.filter(post => post.type === "artist").map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="mt-6">
            <div className="space-y-0">
              {posts.filter(post => post.type === "discussion").map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-0">
              {posts.filter(post => post.type === "user_post").map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Feed;