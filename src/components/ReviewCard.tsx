import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, MessageCircle, MapPin, MoreVertical, Trash2, Reply } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReviews } from "@/hooks/useReviews";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

interface ReviewCardProps {
  id: string;
  business_name: string;
  business_category: string;
  rating: number;
  review_text: string;
  author_name?: string;
  author_avatar?: string;
  created_at: string;
  location?: string;
  helpful_count: number;
  replies_count: number;
  is_helpful?: boolean;
  user_id: string;
}

export function ReviewCard({
  id,
  business_name,
  business_category,
  rating,
  review_text,
  author_name,
  author_avatar,
  created_at,
  location,
  helpful_count,
  replies_count,
  is_helpful,
  user_id
}: ReviewCardProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const { user } = useAuth();
  const { markHelpful, addReply, deleteReview } = useReviews();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      restaurant: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      cafe: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      retail: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      service: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      health: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      beauty: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      automotive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      home: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      fitness: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      education: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      professional: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
      default: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

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

  const handleMarkHelpful = async () => {
    await markHelpful(id);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    
    setSubmittingReply(true);
    try {
      const result = await addReply(id, replyText.trim());
      if (result.success) {
        setReplyText("");
        setShowReply(false);
      }
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    await deleteReview(id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{business_name}</CardTitle>
              <Badge className={getCategoryColor(business_category)}>
                {business_category}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(rating)}
              </div>
              <span className="text-sm text-muted-foreground">({rating}/5)</span>
            </div>
            {location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {location}
              </div>
            )}
          </div>
          
          {user?.id === user_id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Review</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this review? This action cannot be undone.
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
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{review_text}</p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
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
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${is_helpful ? "text-primary" : ""}`}
              onClick={handleMarkHelpful}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{helpful_count}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setShowReply(!showReply)}
            >
              <Reply className="h-4 w-4" />
              <span>{replies_count}</span>
            </Button>
          </div>
        </div>

        {/* Reply Section */}
        {showReply && (
          <div className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Add a Reply</Label>
              <Textarea
                placeholder="Share your thoughts on this review..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px]"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Share your perspective</span>
                <span>{replyText.length}/500</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || submittingReply}
              >
                {submittingReply ? "Posting..." : "Post Reply"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReply(false);
                  setReplyText("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}