import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Plus } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";

interface WriteReviewDialogProps {
  children: React.ReactNode;
}

const businessCategories = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "retail", label: "Retail Store" },
  { value: "service", label: "Service Business" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Health & Wellness" },
  { value: "beauty", label: "Beauty & Spa" },
  { value: "automotive", label: "Automotive" },
  { value: "home", label: "Home & Garden" },
  { value: "fitness", label: "Fitness & Sports" },
  { value: "education", label: "Education" },
  { value: "professional", label: "Professional Services" },
  { value: "other", label: "Other" }
];

export function WriteReviewDialog({ children }: WriteReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    business_name: "",
    business_category: "",
    location: "",
    review_text: ""
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { createReview, creating } = useReviews();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = "Business name is required";
    }

    if (!formData.business_category) {
      newErrors.business_category = "Please select a category";
    }

    if (rating === 0) {
      newErrors.rating = "Please provide a rating";
    }

    if (!formData.review_text.trim()) {
      newErrors.review_text = "Review text is required";
    } else if (formData.review_text.trim().length < 10) {
      newErrors.review_text = "Review must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const result = await createReview({
      business_name: formData.business_name.trim(),
      business_category: formData.business_category,
      rating,
      review_text: formData.review_text.trim(),
      location: formData.location.trim() || undefined
    });

    if (result.success) {
      setOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setFormData({
      business_name: "",
      business_category: "",
      location: "",
      review_text: ""
    });
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={i}
          type="button"
          className={`p-1 transition-colors ${
            isFilled 
              ? "text-yellow-400 hover:text-yellow-500" 
              : "text-gray-300 hover:text-yellow-400"
          }`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star className="h-8 w-8 fill-current" />
        </button>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Write a Review
          </DialogTitle>
          <DialogDescription>
            Share your experience with a local business. Your review helps the community make informed decisions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              placeholder="Enter business name"
              value={formData.business_name}
              onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
              className={errors.business_name ? "border-destructive" : ""}
            />
            {errors.business_name && (
              <p className="text-sm text-destructive">{errors.business_name}</p>
            )}
          </div>

          {/* Business Category */}
          <div className="space-y-2">
            <Label htmlFor="business_category">Business Category *</Label>
            <Select
              value={formData.business_category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, business_category: value }))}
            >
              <SelectTrigger className={errors.business_category ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {businessCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.business_category && (
              <p className="text-sm text-destructive">{errors.business_category}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="e.g., Downtown, West Side, etc."
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center gap-2">
              {renderStars()}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating}</p>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review_text">Your Review *</Label>
            <Textarea
              id="review_text"
              placeholder="Share your experience with this business. What did you like or dislike? What would you recommend?"
              value={formData.review_text}
              onChange={(e) => setFormData(prev => ({ ...prev, review_text: e.target.value }))}
              className={`min-h-[120px] ${errors.review_text ? "border-destructive" : ""}`}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Minimum 10 characters</span>
              <span>{formData.review_text.length}/1000</span>
            </div>
            {errors.review_text && (
              <p className="text-sm text-destructive">{errors.review_text}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={creating}
            className="min-w-[100px]"
          >
            {creating ? "Posting..." : "Post Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
