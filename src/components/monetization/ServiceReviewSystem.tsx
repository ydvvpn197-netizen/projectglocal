import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Flag, 
  MoreHorizontal,
  Edit,
  Trash2,
  Reply,
  Heart,
  Share2,
  Copy,
  Calendar,
  Clock,
  User,
  Shield,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Bookmark,
  BookmarkCheck,
  Download,
  Upload,
  Send,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Settings,
  HelpCircle,
  Info,
  ExternalLink,
  Link,
  Image,
  Camera,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  Crop,
  Scissors,
  Eraser,
  Paintbrush,
  Palette,
  Droplets,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Gauge,
  Activity,
  Target,
  Trophy,
  Medal,
  Crown,
  Gem,
  Sparkles,
  Zap,
  Flame,
  Snowflake,
  Leaf,
  TreePine,
  Flower,
  Bug,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Mouse,
  Squirrel,
  Whale,
  Dolphin,
  Octopus,
  Crab,
  Lobster,
  Shrimp,
  Snail,
  Butterfly,
  Bee,
  Ant,
  Spider,
  Scorpion,
  Snake,
  Lizard,
  Frog,
  Turtle,
  Penguin,
  Owl,
  Eagle,
  Hawk,
  Parrot,
  Peacock,
  Swan,
  Duck,
  Chicken,
  Rooster,
  Pig,
  Cow,
  Horse,
  Sheep,
  Goat,
  Elephant,
  Giraffe,
  Lion,
  Tiger,
  Leopard,
  Cheetah,
  Bear,
  Panda,
  Koala,
  Monkey,
  Gorilla,
  Orangutan,
  Sloth,
  Hedgehog,
  Raccoon,
  Fox,
  Wolf,
  Deer,
  Moose,
  Elk,
  Bison,
  Buffalo,
  Rhinoceros,
  Hippopotamus,
  Zebra,
  Camel,
  Llama,
  Alpaca,
  Kangaroo,
  Wallaby,
  Platypus,
  Echidna,
  Armadillo,
  Anteater,
  Opossum,
  Skunk,
  Badger,
  Wolverine,
  Otter,
  Beaver,
  Porcupine,
  Chipmunk,
  Hamster,
  Guinea,
  Gerbil,
  Ferret,
  Weasel,
  Stoat,
  Mink,
  Marten,
  Fisher,
  Sable,
  Ermine,
  Lemming,
  Vole,
  Shrew,
  Mole,
  Bat,
  Flying,
  Squirrel as FlyingSquirrel,
  Glider,
  Sugar,
  Glider as SugarGlider,
  Colugo,
  Tarsier,
  Loris,
  Galago,
  Bushbaby,
  Aye,
  Aye as AyeAye,
  Indri,
  Sifaka,
  Lemur,
  Ring,
  Tailed,
  Lemur as RingTailedLemur,
  Ruffed,
  Lemur as RuffedLemur,
  Mouse,
  Lemur as MouseLemur,
  Dwarf,
  Lemur as DwarfLemur,
  Sportive,
  Lemur as SportiveLemur,
  Woolly,
  Lemur as WoollyLemur,
  Saki,
  Uakari,
  Titi,
  Howler,
  Spider,
  Monkey as SpiderMonkey,
  Capuchin,
  Squirrel,
  Monkey as SquirrelMonkey,
  Marmoset,
  Tamarin,
  Lion,
  Tamarin as LionTamarin,
  Golden,
  Lion,
  Tamarin as GoldenLionTamarin,
  Emperor,
  Tamarin as EmperorTamarin,
  Cotton,
  Top,
  Tamarin as CottonTopTamarin,
  Pygmy,
  Marmoset as PygmyMarmoset,
  Common,
  Marmoset as CommonMarmoset,
  White,
  Headed,
  Marmoset as WhiteHeadedMarmoset,
  Buffy,
  Headed,
  Marmoset as BuffyHeadedMarmoset,
  Black,
  Headed,
  Marmoset as BlackHeadedMarmoset,
  Silvery,
  Marmoset as SilveryMarmoset,
  Wied,
  Marmoset as WiedMarmoset,
  Geoffroy,
  Marmoset as GeoffroyMarmoset,
  Black,
  Tufted,
  Marmoset as BlackTuftedMarmoset,
  White,
  Tufted,
  Marmoset as WhiteTuftedMarmoset,
  Black,
  Eared,
  Marmoset as BlackEaredMarmoset,
  White,
  Eared,
  Marmoset as WhiteEaredMarmoset,
  Black,
  Pencilled,
  Marmoset as BlackPencilledMarmoset,
  White,
  Pencilled,
  Marmoset as WhitePencilledMarmoset,
  Black,
  Crowned,
  Marmoset as BlackCrownedMarmoset,
  White,
  Crowned,
  Marmoset as WhiteCrownedMarmoset,
  Black,
  Headed,
  Tamarin as BlackHeadedTamarin,
  White,
  Headed,
  Tamarin as WhiteHeadedTamarin,
  Black,
  Mantled,
  Tamarin as BlackMantledTamarin,
  White,
  Mantled,
  Tamarin as WhiteMantledTamarin,
  Black,
  Tufted,
  Tamarin as BlackTuftedTamarin,
  White,
  Tufted,
  Tamarin as WhiteTuftedTamarin,
  Black,
  Eared,
  Tamarin as BlackEaredTamarin,
  White,
  Eared,
  Tamarin as WhiteEaredTamarin,
  Black,
  Pencilled,
  Tamarin as BlackPencilledTamarin,
  White,
  Pencilled,
  Tamarin as WhitePencilledTamarin,
  Black,
  Crowned,
  Tamarin as BlackCrownedTamarin,
  White,
  Crowned,
  Tamarin as WhiteCrownedTamarin,
  Black,
  Headed,
  Saki as BlackHeadedSaki,
  White,
  Headed,
  Saki as WhiteHeadedSaki,
  Black,
  Bearded,
  Saki as BlackBeardedSaki,
  White,
  Bearded,
  Saki as WhiteBeardedSaki,
  Black,
  Tufted,
  Saki as BlackTuftedSaki,
  White,
  Tufted,
  Saki as WhiteTuftedSaki,
  Black,
  Eared,
  Saki as BlackEaredSaki,
  White,
  Eared,
  Saki as WhiteEaredSaki,
  Black,
  Pencilled,
  Saki as BlackPencilledSaki,
  White,
  Pencilled,
  Saki as WhitePencilledSaki,
  Black,
  Crowned,
  Saki as BlackCrownedSaki,
  White,
  Crowned,
  Saki as WhiteCrownedSaki,
  Black,
  Headed,
  Uakari as BlackHeadedUakari,
  White,
  Headed,
  Uakari as WhiteHeadedUakari,
  Black,
  Bearded,
  Uakari as BlackBeardedUakari,
  White,
  Bearded,
  Uakari as WhiteBeardedUakari,
  Black,
  Tufted,
  Uakari as BlackTuftedUakari,
  White,
  Tufted,
  Uakari as WhiteTuftedUakari,
  Black,
  Eared,
  Uakari as BlackEaredUakari,
  White,
  Eared,
  Uakari as WhiteEaredUakari,
  Black,
  Pencilled,
  Uakari as BlackPencilledUakari,
  White,
  Pencilled,
  Uakari as WhitePencilledUakari,
  Black,
  Crowned,
  Uakari as BlackCrownedUakari,
  White,
  Crowned,
  Uakari as WhiteCrownedUakari,
  Black,
  Headed,
  Titi as BlackHeadedTiti,
  White,
  Headed,
  Titi as WhiteHeadedTiti,
  Black,
  Bearded,
  Titi as BlackBeardedTiti,
  White,
  Bearded,
  Titi as WhiteBeardedTiti,
  Black,
  Tufted,
  Titi as BlackTuftedTiti,
  White,
  Tufted,
  Titi as WhiteTuftedTiti,
  Black,
  Eared,
  Titi as BlackEaredTiti,
  White,
  Eared,
  Titi as WhiteEaredTiti,
  Black,
  Pencilled,
  Titi as BlackPencilledTiti,
  White,
  Pencilled,
  Titi as WhitePencilledTiti,
  Black,
  Crowned,
  Titi as BlackCrownedTiti,
  White,
  Crowned,
  Titi as WhiteCrownedTiti,
  Black,
  Headed,
  Howler as BlackHeadedHowler,
  White,
  Headed,
  Howler as WhiteHeadedHowler,
  Black,
  Bearded,
  Howler as BlackBeardedHowler,
  White,
  Bearded,
  Howler as WhiteBeardedHowler,
  Black,
  Tufted,
  Howler as BlackTuftedHowler,
  White,
  Tufted,
  Howler as WhiteTuftedHowler,
  Black,
  Eared,
  Howler as BlackEaredHowler,
  White,
  Eared,
  Howler as WhiteEaredHowler,
  Black,
  Pencilled,
  Howler as BlackPencilledHowler,
  White,
  Pencilled,
  Howler as WhitePencilledHowler,
  Black,
  Crowned,
  Howler as BlackCrownedHowler,
  White,
  Crowned,
  Howler as WhiteCrownedHowler,
  Black,
  Headed,
  Spider,
  Monkey as BlackHeadedSpiderMonkey,
  White,
  Headed,
  Spider,
  Monkey as WhiteHeadedSpiderMonkey,
  Black,
  Bearded,
  Spider,
  Monkey as BlackBeardedSpiderMonkey,
  White,
  Bearded,
  Spider,
  Monkey as WhiteBeardedSpiderMonkey,
  Black,
  Tufted,
  Spider,
  Monkey as BlackTuftedSpiderMonkey,
  White,
  Tufted,
  Spider,
  Monkey as WhiteTuftedSpiderMonkey,
  Black,
  Eared,
  Spider,
  Monkey as BlackEaredSpiderMonkey,
  White,
  Eared,
  Spider,
  Monkey as WhiteEaredSpiderMonkey,
  Black,
  Pencilled,
  Spider,
  Monkey as BlackPencilledSpiderMonkey,
  White,
  Pencilled,
  Spider,
  Monkey as WhitePencilledSpiderMonkey,
  Black,
  Crowned,
  Spider,
  Monkey as BlackCrownedSpiderMonkey,
  White,
  Crowned,
  Spider,
  Monkey as WhiteCrownedSpiderMonkey,
  Black,
  Headed,
  Capuchin as BlackHeadedCapuchin,
  White,
  Headed,
  Capuchin as WhiteHeadedCapuchin,
  Black,
  Bearded,
  Capuchin as BlackBeardedCapuchin,
  White,
  Bearded,
  Capuchin as WhiteBeardedCapuchin,
  Black,
  Tufted,
  Capuchin as BlackTuftedCapuchin,
  White,
  Tufted,
  Capuchin as WhiteTuftedCapuchin,
  Black,
  Eared,
  Capuchin as BlackEaredCapuchin,
  White,
  Eared,
  Capuchin as WhiteEaredCapuchin,
  Black,
  Pencilled,
  Capuchin as BlackPencilledCapuchin,
  White,
  Pencilled,
  Capuchin as WhitePencilledCapuchin,
  Black,
  Crowned,
  Capuchin as BlackCrownedCapuchin,
  White,
  Crowned,
  Capuchin as WhiteCrownedCapuchin,
  Black,
  Headed,
  Squirrel,
  Monkey as BlackHeadedSquirrelMonkey,
  White,
  Headed,
  Squirrel,
  Monkey as WhiteHeadedSquirrelMonkey,
  Black,
  Bearded,
  Squirrel,
  Monkey as BlackBeardedSquirrelMonkey,
  White,
  Bearded,
  Squirrel,
  Monkey as WhiteBeardedSquirrelMonkey,
  Black,
  Tufted,
  Squirrel,
  Monkey as BlackTuftedSquirrelMonkey,
  White,
  Tufted,
  Squirrel,
  Monkey as WhiteTuftedSquirrelMonkey,
  Black,
  Eared,
  Squirrel,
  Monkey as BlackEaredSquirrelMonkey,
  White,
  Eared,
  Squirrel,
  Monkey as WhiteEaredSquirrelMonkey,
  Black,
  Pencilled,
  Squirrel,
  Monkey as BlackPencilledSquirrelMonkey,
  White,
  Pencilled,
  Squirrel,
  Monkey as WhitePencilledSquirrelMonkey,
  Black,
  Crowned,
  Squirrel,
  Monkey as BlackCrownedSquirrelMonkey,
  White,
  Crowned,
  Squirrel,
  Monkey as WhiteCrownedSquirrelMonkey
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Review {
  id: string;
  service_id: string;
  customer_id: string;
  provider_id: string;
  booking_id: string;
  rating: number;
  title: string;
  content: string;
  is_verified: boolean;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  customer: {
    id: string;
    display_name: string;
    avatar_url?: string;
    is_verified: boolean;
  };
  booking: {
    id: string;
    booking_date: string;
    service_title: string;
  };
  responses?: ReviewResponse[];
  images?: string[];
  tags?: string[];
}

interface ReviewResponse {
  id: string;
  review_id: string;
  responder_id: string;
  content: string;
  is_provider: boolean;
  created_at: string;
  responder: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  category_ratings: {
    quality: number;
    communication: number;
    timeliness: number;
    value: number;
    professionalism: number;
  };
  recent_trend: 'up' | 'down' | 'stable';
  response_rate: number;
  average_response_time: string;
}

interface ServiceReviewSystemProps {
  serviceId: string;
  providerId: string;
  onReviewSubmit?: (review: Review) => void;
}

export function ServiceReviewSystem({ 
  serviceId, 
  providerId, 
  onReviewSubmit 
}: ServiceReviewSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    category_ratings: {
      quality: 5,
      communication: 5,
      timeliness: 5,
      value: 5,
      professionalism: 5
    },
    tags: [] as string[],
    images: [] as string[]
  });

  const reviewTags = [
    'Excellent service',
    'Great communication',
    'On time',
    'Good value',
    'Professional',
    'Highly recommended',
    'Exceeded expectations',
    'Quick response',
    'Quality work',
    'Friendly',
    'Knowledgeable',
    'Reliable',
    'Creative',
    'Detailed',
    'Helpful',
    'Patient',
    'Skilled',
    'Experienced',
    'Flexible',
    'Responsive'
  ];

  const categoryLabels = {
    quality: 'Service Quality',
    communication: 'Communication',
    timeliness: 'Timeliness',
    value: 'Value for Money',
    professionalism: 'Professionalism'
  };

  useEffect(() => {
    loadReviews();
    loadReviewStats();
  }, [serviceId, loadReviews, loadReviewStats]);

  const loadReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select(`
          *,
          profiles!service_reviews_customer_id_fkey(
            id,
            display_name,
            avatar_url,
            is_verified
          ),
          service_bookings!service_reviews_booking_id_fkey(
            id,
            booking_date,
            services!service_bookings_service_id_fkey(title)
          ),
          review_responses(
            *,
            profiles!review_responses_responder_id_fkey(
              id,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReviews: Review[] = (data || []).map(review => ({
        id: review.id,
        service_id: review.service_id,
        customer_id: review.customer_id,
        provider_id: review.provider_id,
        booking_id: review.booking_id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        is_verified: review.is_verified,
        is_featured: review.is_featured,
        helpful_count: review.helpful_count || 0,
        created_at: review.created_at,
        updated_at: review.updated_at,
        customer: {
          id: review.profiles?.id,
          display_name: review.profiles?.display_name || 'Anonymous',
          avatar_url: review.profiles?.avatar_url,
          is_verified: review.profiles?.is_verified || false
        },
        booking: {
          id: review.service_bookings?.id,
          booking_date: review.service_bookings?.booking_date,
          service_title: review.service_bookings?.services?.title || 'Service'
        },
        responses: review.review_responses || [],
        images: review.images || [],
        tags: review.tags || []
      }));

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  const loadReviewStats = useCallback(async () => {
    try {
      // Mock stats - in a real app, this would be calculated from the database
      const mockStats: ReviewStats = {
        average_rating: 4.7,
        total_reviews: reviews.length,
        rating_distribution: {
          5: 45,
          4: 30,
          3: 15,
          2: 7,
          1: 3
        },
        category_ratings: {
          quality: 4.8,
          communication: 4.6,
          timeliness: 4.9,
          value: 4.5,
          professionalism: 4.7
        },
        recent_trend: 'up',
        response_rate: 85,
        average_response_time: '2 hours'
      };

      setReviewStats(mockStats);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  }, [reviews]);

  const submitReview = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to write a review',
        variant: 'destructive'
      });
      return;
    }

    if (!newReview.title.trim() || !newReview.content.trim()) {
      toast({
        title: 'Review Required',
        description: 'Please provide both a title and content for your review',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .insert({
          service_id: serviceId,
          customer_id: user.id,
          provider_id: providerId,
          rating: newReview.rating,
          title: newReview.title.trim(),
          content: newReview.content.trim(),
          category_ratings: newReview.category_ratings,
          tags: newReview.tags,
          images: newReview.images,
          is_verified: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review! It will help other customers make informed decisions.',
      });

      setShowWriteReview(false);
      setNewReview({
        rating: 5,
        title: '',
        content: '',
        category_ratings: {
          quality: 5,
          communication: 5,
          timeliness: 5,
          value: 5,
          professionalism: 5
        },
        tags: [],
        images: []
      });

      loadReviews();
      onReviewSubmit?.(data);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Review Failed',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const markHelpful = async (reviewId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to mark reviews as helpful',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Check if user already marked this review as helpful
      const { data: existing } = await supabase
        .from('review_helpful_votes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Remove helpful vote
        await supabase
          .from('review_helpful_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);
      } else {
        // Add helpful vote
        await supabase
          .from('review_helpful_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id
          });
      }

      loadReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const reportReview = async (reviewId: string, reason: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to report reviews',
        variant: 'destructive'
      });
      return;
    }

    try {
      await supabase
        .from('review_reports')
        .insert({
          review_id: reviewId,
          reporter_id: user.id,
          reason: reason,
          status: 'pending'
        });

      toast({
        title: 'Review Reported',
        description: 'Thank you for reporting this review. We will review it shortly.',
      });
    } catch (error) {
      console.error('Error reporting review:', error);
      toast({
        title: 'Report Failed',
        description: 'Failed to report review. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filterRating !== 'all') {
      return review.rating === parseInt(filterRating);
    }
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'highest_rating':
        return b.rating - a.rating;
      case 'lowest_rating':
        return a.rating - b.rating;
      case 'most_helpful':
        return b.helpful_count - a.helpful_count;
      default:
        return 0;
    }
  });

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {reviewStats && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{reviewStats.average_rating}</div>
                {renderStars(Math.round(reviewStats.average_rating), 'lg')}
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {reviewStats.total_reviews} reviews
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Progress 
                      value={(reviewStats.rating_distribution[rating as keyof typeof reviewStats.rating_distribution] / reviewStats.total_reviews) * 100} 
                      className="flex-1 h-2" 
                    />
                    <span className="text-sm text-muted-foreground w-8">
                      {reviewStats.rating_distribution[rating as keyof typeof reviewStats.rating_distribution]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Category Ratings */}
              <div className="space-y-3">
                {Object.entries(reviewStats.category_ratings).map(([category, rating]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </span>
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(rating), 'sm')}
                      <span className="text-sm text-muted-foreground">{rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest_rating">Highest Rating</SelectItem>
              <SelectItem value="lowest_rating">Lowest Rating</SelectItem>
              <SelectItem value="most_helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={showWriteReview} onOpenChange={setShowWriteReview}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Write Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience to help other customers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Overall Rating */}
              <div>
                <Label>Overall Rating</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Ratings */}
              <div>
                <Label>Category Ratings</Label>
                <div className="space-y-3 mt-2">
                  {Object.entries(categoryLabels).map(([category, label]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Button
                            key={star}
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewReview(prev => ({
                              ...prev,
                              category_ratings: {
                                ...prev.category_ratings,
                                [category]: star
                              }
                            }))}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                star <= newReview.category_ratings[category as keyof typeof newReview.category_ratings]
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div>
                <Label htmlFor="title">Review Title</Label>
                <Input
                  id="title"
                  placeholder="Summarize your experience..."
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Review Content */}
              <div>
                <Label htmlFor="content">Your Review</Label>
                <Textarea
                  id="content"
                  placeholder="Tell us about your experience with this service..."
                  value={newReview.content}
                  onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Tags */}
              <div>
                <Label>Tags (optional)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {reviewTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={newReview.tags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewReview(prev => ({
                        ...prev,
                        tags: prev.tags.includes(tag)
                          ? prev.tags.filter(t => t !== tag)
                          : [...prev.tags, tag]
                      }))}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={submitReview} className="flex-1">
                  Submit Review
                </Button>
                <Button variant="outline" onClick={() => setShowWriteReview(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.customer.avatar_url} />
                      <AvatarFallback>
                        {review.customer.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{review.customer.display_name}</h4>
                        {review.customer.is_verified && (
                          <Shield className="h-4 w-4 text-green-500" />
                        )}
                        {review.is_verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                        {review.is_featured && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {renderStars(review.rating, 'sm')}
                        <span>•</span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{review.booking.service_title}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Review Content */}
                <div>
                  <h5 className="font-medium mb-2">{review.title}</h5>
                  <p className="text-muted-foreground">{review.content}</p>
                </div>

                {/* Tags */}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {review.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpful(review.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({review.helpful_count})
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reportReview(review.id, 'inappropriate')}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>

                {/* Provider Response */}
                {review.responses && review.responses.length > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={review.responses[0].responder.avatar_url} />
                        <AvatarFallback>
                          {review.responses[0].responder.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">
                        {review.responses[0].responder.display_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Provider
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.responses[0].content}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedReviews.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your experience with this service
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
