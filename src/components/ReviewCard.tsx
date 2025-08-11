import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, MessageCircle, MapPin } from "lucide-react";

interface ReviewCardProps {
  id: string;
  businessName: string;
  category: string;
  rating: number;
  reviewText: string;
  author: string;
  timeAgo: string;
  location: string;
  helpful: number;
  replies: number;
  isHelpful: boolean;
  onMarkHelpful: (reviewId: string) => void;
}

export function ReviewCard({
  id,
  businessName,
  category,
  rating,
  reviewText,
  author,
  timeAgo,
  location,
  helpful,
  replies,
  isHelpful,
  onMarkHelpful
}: ReviewCardProps) {
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
      service: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      retail: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      default: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{businessName}</CardTitle>
              <Badge className={getCategoryColor(category)}>
                {category}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(rating)}
              </div>
              <span className="text-sm text-muted-foreground">({rating}/5)</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {location}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{reviewText}</p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <span>by {author}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isHelpful ? "text-primary" : ""}`}
              onClick={() => onMarkHelpful(id)}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{helpful}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{replies}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}