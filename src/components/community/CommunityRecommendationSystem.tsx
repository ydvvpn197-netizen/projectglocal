import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Heart, 
  Star, 
  TrendingUp, 
  Zap, 
  Target, 
  Award, 
  Crown,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Settings,
  Filter,
  Search,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero,
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
  Move3d,
  MoveHorizontal,
  MoveVertical,
  RotateCcw as RotateCcwIcon,
  RotateCw as RotateCwIcon,
  FlipHorizontal,
  FlipVertical,
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
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  Trophy,
  Medal,
  Gem,
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

interface Recommendation {
  id: string;
  type: 'community' | 'event' | 'service' | 'user' | 'content';
  title: string;
  description: string;
  confidence_score: number;
  reason: string;
  category: string;
  tags: string[];
  metadata: {
    member_count?: number;
    event_date?: string;
    price_range?: string;
    rating?: number;
    location?: string;
    organizer?: string;
    [key: string]: any;
  };
  created_at: string;
}

interface RecommendationEngine {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  weight: number;
  last_updated: string;
}

interface UserPreferences {
  interests: string[];
  location_preferences: {
    city: string;
    state: string;
    radius: number;
  };
  activity_level: 'low' | 'medium' | 'high';
  preferred_categories: string[];
  budget_range: {
    min: number;
    max: number;
  };
  time_preferences: {
    weekdays: string[];
    weekends: string[];
  };
}

interface CommunityRecommendationSystemProps {
  userId?: string;
  onRecommendationClick?: (recommendation: Recommendation) => void;
}

export function CommunityRecommendationSystem({ 
  userId, 
  onRecommendationClick 
}: CommunityRecommendationSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationEngines, setRecommendationEngines] = useState<RecommendationEngine[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [feedback, setFeedback] = useState<Map<string, 'like' | 'dislike' | null>>(new Map());

  useEffect(() => {
    if (user || userId) {
      loadRecommendations();
      loadRecommendationEngines();
      loadUserPreferences();
    }
  }, [user, userId]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // Mock recommendation data - in a real app, this would come from ML models
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          type: 'community',
          title: 'Mumbai Photography Enthusiasts',
          description: 'Join 500+ photographers sharing tips, organizing meetups, and showcasing their work',
          confidence_score: 0.92,
          reason: 'Based on your interest in photography and location in Mumbai',
          category: 'Photography',
          tags: ['photography', 'mumbai', 'meetups', 'art'],
          metadata: {
            member_count: 523,
            location: 'Mumbai, Maharashtra',
            activity_level: 'high',
            last_activity: '2 hours ago'
          },
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'event',
          title: 'Digital Art Workshop',
          description: 'Learn advanced digital painting techniques from industry professionals',
          confidence_score: 0.88,
          reason: 'Matches your interest in digital art and available this weekend',
          category: 'Art & Design',
          tags: ['digital-art', 'workshop', 'learning', 'weekend'],
          metadata: {
            event_date: '2024-02-17',
            event_time: '10:00 AM - 4:00 PM',
            price_range: '₹2000 - ₹3000',
            location: 'Art Studio, Bandra',
            organizer: 'Creative Hub Mumbai',
            rating: 4.8
          },
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          type: 'service',
          title: 'Professional Music Production',
          description: 'High-quality music production services with state-of-the-art equipment',
          confidence_score: 0.85,
          reason: 'Based on your music interests and budget preferences',
          category: 'Music & Audio',
          tags: ['music-production', 'professional', 'studio', 'audio'],
          metadata: {
            price_range: '₹5000 - ₹15000',
            rating: 4.9,
            location: 'Andheri West, Mumbai',
            provider: 'SoundCraft Studios',
            availability: 'Mon-Fri 9AM-8PM'
          },
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          type: 'user',
          title: 'Sarah Chen - Digital Artist',
          description: 'Connect with a talented digital artist who shares similar interests',
          confidence_score: 0.78,
          reason: 'Similar interests in digital art and photography',
          category: 'Networking',
          tags: ['digital-artist', 'photography', 'collaboration', 'networking'],
          metadata: {
            follower_count: 1250,
            location: 'Mumbai, Maharashtra',
            mutual_connections: 12,
            last_active: '1 hour ago',
            verified: true
          },
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          type: 'content',
          title: 'Advanced Photoshop Techniques',
          description: 'Master advanced photo editing techniques with this comprehensive guide',
          confidence_score: 0.82,
          reason: 'Based on your photography interests and skill level',
          category: 'Learning',
          tags: ['photoshop', 'photo-editing', 'tutorial', 'advanced'],
          metadata: {
            content_type: 'video_tutorial',
            duration: '2 hours 30 minutes',
            difficulty: 'intermediate',
            rating: 4.7,
            views: 15420
          },
          created_at: new Date().toISOString()
        }
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recommendations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendationEngines = async () => {
    try {
      // Mock recommendation engines
      const mockEngines: RecommendationEngine[] = [
        {
          id: '1',
          name: 'Collaborative Filtering',
          description: 'Recommends based on similar users\' preferences',
          is_active: true,
          weight: 0.4,
          last_updated: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Content-Based Filtering',
          description: 'Recommends based on item characteristics and user preferences',
          is_active: true,
          weight: 0.3,
          last_updated: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Location-Based',
          description: 'Recommends based on geographic proximity and local trends',
          is_active: true,
          weight: 0.2,
          last_updated: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Temporal Patterns',
          description: 'Recommends based on time-based user behavior patterns',
          is_active: true,
          weight: 0.1,
          last_updated: new Date().toISOString()
        }
      ];

      setRecommendationEngines(mockEngines);
    } catch (error) {
      console.error('Error loading recommendation engines:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      // Mock user preferences
      const mockPreferences: UserPreferences = {
        interests: ['photography', 'digital-art', 'music', 'technology'],
        location_preferences: {
          city: 'Mumbai',
          state: 'Maharashtra',
          radius: 25
        },
        activity_level: 'medium',
        preferred_categories: ['Art & Design', 'Photography', 'Music & Audio'],
        budget_range: {
          min: 1000,
          max: 10000
        },
        time_preferences: {
          weekdays: ['evening'],
          weekends: ['morning', 'afternoon']
        }
      };

      setUserPreferences(mockPreferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const handleFeedback = async (recommendationId: string, feedbackType: 'like' | 'dislike') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to provide feedback',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Update local state
      setFeedback(prev => new Map(prev.set(recommendationId, feedbackType)));

      // In a real app, this would send feedback to the recommendation engine
      await supabase
        .from('recommendation_feedback')
        .insert({
          user_id: user.id,
          recommendation_id: recommendationId,
          feedback_type: feedbackType,
          created_at: new Date().toISOString()
        });

      toast({
        title: 'Feedback Recorded',
        description: 'Thank you for your feedback! This helps improve our recommendations.',
      });
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'community': return Users;
      case 'event': return Calendar;
      case 'service': return Star;
      case 'user': return User;
      case 'content': return FileText;
      default: return Target;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'community': return 'text-blue-600';
      case 'event': return 'text-green-600';
      case 'service': return 'text-orange-600';
      case 'user': return 'text-purple-600';
      case 'content': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (activeTab === 'all') return true;
    return rec.type === activeTab;
  });

  const renderRecommendationCard = (recommendation: Recommendation) => {
    const RecommendationIcon = getRecommendationIcon(recommendation.type);
    const iconColor = getRecommendationColor(recommendation.type);
    const userFeedback = feedback.get(recommendation.id);

    return (
      <Card key={recommendation.id} className="group hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-muted ${iconColor}`}>
              <RecommendationIcon className="h-6 w-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{recommendation.title}</h3>
                  <p className="text-muted-foreground mb-2">{recommendation.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {Math.round(recommendation.confidence_score * 100)}% match
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(recommendation.id, 'like')}
                      className={userFeedback === 'like' ? 'text-green-600' : ''}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(recommendation.id, 'dislike')}
                      className={userFeedback === 'dislike' ? 'text-red-600' : ''}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recommendation Reason */}
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Why this recommendation?</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">{recommendation.reason}</p>
              </div>

              {/* Metadata */}
              <div className="space-y-2 mb-4">
                {recommendation.metadata.member_count && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{recommendation.metadata.member_count.toLocaleString()} members</span>
                  </div>
                )}
                {recommendation.metadata.event_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(recommendation.metadata.event_date).toLocaleDateString()}</span>
                  </div>
                )}
                {recommendation.metadata.price_range && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{recommendation.metadata.price_range}</span>
                  </div>
                )}
                {recommendation.metadata.rating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{recommendation.metadata.rating}</span>
                  </div>
                )}
                {recommendation.metadata.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{recommendation.metadata.location}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {recommendation.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  onClick={() => onRecommendationClick?.(recommendation)}
                >
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading recommendations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <p className="text-muted-foreground">
            AI-powered recommendations based on your interests and behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
          <Button variant="outline" size="sm">
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Recommendation Engines Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommendation Engines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendationEngines.map((engine) => (
              <div key={engine.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{engine.name}</h4>
                  <Badge variant={engine.is_active ? "default" : "secondary"} className="text-xs">
                    {engine.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{engine.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Weight</span>
                    <span>{Math.round(engine.weight * 100)}%</span>
                  </div>
                  <Progress value={engine.weight * 100} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
          <TabsTrigger value="community">Communities</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
          <TabsTrigger value="service">Services</TabsTrigger>
          <TabsTrigger value="user">People</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRecommendations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
                <p className="text-muted-foreground">
                  Try updating your preferences or interests to get better recommendations
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRecommendations.map(renderRecommendationCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* User Preferences Summary */}
      {userPreferences && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Interests</h4>
                <div className="flex flex-wrap gap-1">
                  {userPreferences.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Location</h4>
                <p className="text-sm text-muted-foreground">
                  {userPreferences.location_preferences.city}, {userPreferences.location_preferences.state}
                </p>
                <p className="text-sm text-muted-foreground">
                  Within {userPreferences.location_preferences.radius} km
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Budget Range</h4>
                <p className="text-sm text-muted-foreground">
                  ₹{userPreferences.budget_range.min.toLocaleString()} - ₹{userPreferences.budget_range.max.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
