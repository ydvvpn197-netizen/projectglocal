import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Heart, Share2, Plus } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";

const Community = () => {
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

        {/* Recent Discussions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Discussions</h2>
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
        </section>

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