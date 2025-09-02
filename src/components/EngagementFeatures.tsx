import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Award, Target, Trophy, Zap, Users } from "lucide-react";

export function EngagementFeatures() {
  const [userLevel] = useState(3);
  const [userPoints] = useState(2450);
  const [pointsToNext] = useState(550);
  
  const achievements = [
    {
      id: 1,
      title: "Community Helper",
      description: "Helped 10 community members",
      icon: Heart,
      unlocked: true,
      rarity: "common"
    },
    {
      id: 2,
      title: "Event Organizer",
      description: "Created 5 successful events",
      icon: Trophy,
      unlocked: true,
      rarity: "rare"
    },
    {
      id: 3,
      title: "Local Explorer",
      description: "Visited 25 local businesses",
      icon: Target,
      unlocked: false,
      rarity: "epic"
    }
  ];

  const challenges = [
    {
      id: 1,
      title: "Meet 3 New People This Week",
      description: "Connect with fellow community members",
      progress: 1,
      target: 3,
      reward: "200 points",
      icon: Users
    },
    {
      id: 2,
      title: "Try 2 New Local Restaurants",
      description: "Support local dining establishments",
      progress: 0,
      target: 2,
      reward: "150 points + Badge",
      icon: Zap
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "rare": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "epic": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* User Level & Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Community Level {userLevel}
          </CardTitle>
          <CardDescription>
            {userPoints} points • {pointsToNext} points to level {userLevel + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(userPoints / (userPoints + pointsToNext)) * 100} className="h-3" />
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Your community accomplishments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    achievement.unlocked 
                      ? "bg-card" 
                      : "bg-muted/50 opacity-60"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    achievement.unlocked 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <div className="text-green-500">
                      <Trophy className="h-5 w-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Challenges</CardTitle>
          <CardDescription>Complete challenges to earn points and badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => {
              const IconComponent = challenge.icon;
              const progressPercent = (challenge.progress / challenge.target) * 100;
              
              return (
                <div key={challenge.id} className="space-y-3 p-4 rounded-lg border bg-card">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{challenge.title}</h4>
                        <Badge variant="outline">{challenge.reward}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{challenge.progress}/{challenge.target}</span>
                          <span>{progressPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
