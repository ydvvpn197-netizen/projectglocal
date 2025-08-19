import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart3, Clock, Users, Share2, MoreVertical, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePolls } from "@/hooks/usePolls";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollCardProps {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  total_votes: number;
  time_remaining?: string;
  has_voted?: boolean;
  user_vote?: string;
  author_name?: string;
  author_avatar?: string;
  created_at: string;
  user_id: string;
}

export function PollCard({ 
  id, 
  title, 
  description, 
  options, 
  total_votes, 
  time_remaining, 
  has_voted, 
  user_vote,
  author_name,
  author_avatar,
  created_at,
  user_id
}: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const { user } = useAuth();
  const { votePoll, deletePoll, sharePoll } = usePolls();

  const handleVote = async () => {
    if (selectedOption && !has_voted) {
      await votePoll(id, selectedOption);
    }
  };

  const handleDelete = async () => {
    await deletePoll(id);
  };

  const handleShare = async () => {
    await sharePoll(id);
  };

  const getPercentage = (votes: number) => 
    total_votes > 0 ? (votes / total_votes) * 100 : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            {description && <CardDescription>{description}</CardDescription>}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-5 w-5">
                <AvatarImage src={author_avatar} />
                <AvatarFallback className="text-xs">
                  {author_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>by {author_name}</span>
              <span>•</span>
              <span>{formatDate(created_at)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {time_remaining && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {time_remaining}
              </Badge>
            )}
            
            {user?.id === user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Poll</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this poll? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {options.map((option) => {
            const percentage = getPercentage(option.votes);
            const isSelected = selectedOption === option.id;
            const isUserVote = user_vote === option.id;
            
            return (
              <div key={option.id} className="space-y-2">
                <div 
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    has_voted 
                      ? isUserVote 
                        ? "bg-primary/10 border-primary" 
                        : "bg-muted/50"
                      : isSelected 
                        ? "bg-primary/10 border-primary" 
                        : "bg-card hover:bg-muted/50"
                  }`}
                  onClick={() => !has_voted && setSelectedOption(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    <div className="flex items-center gap-2">
                      {has_voted && (
                        <span className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                      )}
                      {isUserVote && (
                        <Badge variant="secondary" className="text-xs">Your vote</Badge>
                      )}
                    </div>
                  </div>
                  
                  {has_voted && (
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
            <span>{total_votes} votes</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            {!has_voted && (
              <Button 
                onClick={handleVote}
                disabled={!selectedOption}
                size="sm"
              >
                Vote
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}