import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Clock, Users } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollCardProps {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  totalVotes: number;
  timeRemaining: string;
  hasVoted: boolean;
  userVote?: string;
  onVote: (pollId: string, optionId: string) => void;
}

export function PollCard({ 
  id, 
  title, 
  description, 
  options, 
  totalVotes, 
  timeRemaining, 
  hasVoted, 
  userVote,
  onVote 
}: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleVote = () => {
    if (selectedOption && !hasVoted) {
      onVote(id, selectedOption);
    }
  };

  const getPercentage = (votes: number) => 
    totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {options.map((option) => {
            const percentage = getPercentage(option.votes);
            const isSelected = selectedOption === option.id;
            const isUserVote = userVote === option.id;
            
            return (
              <div key={option.id} className="space-y-2">
                <div 
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    hasVoted 
                      ? isUserVote 
                        ? "bg-primary/10 border-primary" 
                        : "bg-muted/50"
                      : isSelected 
                        ? "bg-primary/10 border-primary" 
                        : "bg-card hover:bg-muted/50"
                  }`}
                  onClick={() => !hasVoted && setSelectedOption(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    <div className="flex items-center gap-2">
                      {hasVoted && (
                        <span className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                      )}
                      {isUserVote && (
                        <Badge variant="secondary" className="text-xs">Your vote</Badge>
                      )}
                    </div>
                  </div>
                  
                  {hasVoted && (
                    <div className="mt-2">
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{totalVotes} votes</span>
          </div>
          
          {!hasVoted && (
            <Button 
              onClick={handleVote}
              disabled={!selectedOption}
              size="sm"
            >
              Vote
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}