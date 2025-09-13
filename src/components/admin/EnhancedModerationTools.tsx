import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  Flag, 
  Eye, 
  EyeOff, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MessageSquare, 
  Image, 
  Video, 
  FileText, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Share2, 
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
  Camera, 
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
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart, 
  AreaChart, 
  Target, 
  Award, 
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

interface ModerationItem {
  id: string;
  type: 'post' | 'comment' | 'user' | 'service' | 'event';
  content: string;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
    is_verified: boolean;
  };
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'escalated';
  reported_by: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  created_at: string;
  metadata?: any;
}

interface ModerationStats {
  total_reports: number;
  pending_reports: number;
  resolved_today: number;
  average_resolution_time: string;
  top_violation_types: Array<{
    type: string;
    count: number;
  }>;
}

interface ModerationAction {
  id: string;
  type: 'approve' | 'reject' | 'escalate' | 'warn' | 'ban' | 'delete';
  reason: string;
  notes?: string;
  duration?: number; // for temporary actions
}

interface EnhancedModerationToolsProps {
  onActionComplete?: (action: ModerationAction) => void;
}

export function EnhancedModerationTools({ onActionComplete }: EnhancedModerationToolsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [moderationStats, setModerationStats] = useState<ModerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    setIsLoading(true);
    try {
      // Mock moderation data
      const mockItems: ModerationItem[] = [
        {
          id: '1',
          type: 'post',
          content: 'This is inappropriate content that violates community guidelines...',
          author: {
            id: 'user1',
            display_name: 'John Doe',
            avatar_url: undefined,
            is_verified: false
          },
          reason: 'Inappropriate content',
          severity: 'high',
          status: 'pending',
          reported_by: {
            id: 'user2',
            display_name: 'Jane Smith',
            avatar_url: undefined
          },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          metadata: {
            post_id: 'post123',
            original_content: 'Full post content here...',
            violation_type: 'harassment'
          }
        },
        {
          id: '2',
          type: 'comment',
          content: 'Spam comment with promotional content',
          author: {
            id: 'user3',
            display_name: 'Spam User',
            avatar_url: undefined,
            is_verified: false
          },
          reason: 'Spam',
          severity: 'medium',
          status: 'pending',
          reported_by: {
            id: 'user4',
            display_name: 'Moderator',
            avatar_url: undefined
          },
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          metadata: {
            comment_id: 'comment456',
            parent_post_id: 'post789'
          }
        },
        {
          id: '3',
          type: 'user',
          content: 'User profile with inappropriate content',
          author: {
            id: 'user5',
            display_name: 'Inappropriate User',
            avatar_url: undefined,
            is_verified: false
          },
          reason: 'Inappropriate profile',
          severity: 'critical',
          status: 'pending',
          reported_by: {
            id: 'user6',
            display_name: 'Community Member',
            avatar_url: undefined
          },
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          metadata: {
            user_id: 'user5',
            profile_violations: ['inappropriate_avatar', 'offensive_bio']
          }
        }
      ];

      const mockStats: ModerationStats = {
        total_reports: 1247,
        pending_reports: 23,
        resolved_today: 45,
        average_resolution_time: '2.5 hours',
        top_violation_types: [
          { type: 'Spam', count: 156 },
          { type: 'Harassment', count: 89 },
          { type: 'Inappropriate Content', count: 67 },
          { type: 'Fake Information', count: 34 },
          { type: 'Copyright Violation', count: 23 }
        ]
      };

      setModerationItems(mockItems);
      setModerationStats(mockStats);
    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load moderation data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerationAction = async (action: ModerationAction) => {
    if (!selectedItem) return;

    try {
      // Update the item status
      setModerationItems(prev => 
        prev.map(item => 
          item.id === selectedItem.id 
            ? { ...item, status: action.type === 'approve' ? 'approved' : 'rejected' }
            : item
        )
      );

      // In a real app, this would update the database
      await supabase
        .from('moderation_actions')
        .insert({
          moderation_item_id: selectedItem.id,
          moderator_id: user?.id,
          action_type: action.type,
          reason: action.reason,
          notes: action.notes,
          created_at: new Date().toISOString()
        });

      toast({
        title: 'Action Completed',
        description: `Successfully ${action.type}d the ${selectedItem.type}`,
      });

      setShowActionDialog(false);
      setSelectedItem(null);
      onActionComplete?.(action);
    } catch (error) {
      console.error('Error performing moderation action:', error);
      toast({
        title: 'Action Failed',
        description: 'Failed to complete the moderation action',
        variant: 'destructive'
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewed': return 'text-blue-600 bg-blue-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'escalated': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return FileText;
      case 'comment': return MessageSquare;
      case 'user': return User;
      case 'service': return Star;
      case 'event': return Calendar;
      default: return AlertTriangle;
    }
  };

  const filteredItems = moderationItems.filter(item => {
    const matchesTab = activeTab === 'all' || item.status === activeTab;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || item.severity === filterSeverity;
    const matchesSearch = !searchQuery || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesType && matchesSeverity && matchesSearch;
  });

  const renderModerationItem = (item: ModerationItem) => {
    const TypeIcon = getTypeIcon(item.type);

    return (
      <Card key={item.id} className="group hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-muted">
              <TypeIcon className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.reason}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{item.content}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(item.severity)}>
                    {item.severity}
                  </Badge>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={item.author.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {item.author.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{item.author.display_name}</span>
                  {item.author.is_verified && (
                    <Shield className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>Reported by {item.reported_by.display_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowActionDialog(true);
                  }}
                >
                  Review
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
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
          <div className="text-center">Loading moderation tools...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Moderation Dashboard</h2>
          <p className="text-muted-foreground">
            Manage community content and user behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Moderation Stats */}
      {moderationStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{moderationStats.total_reports}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{moderationStats.pending_reports}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                  <p className="text-2xl font-bold">{moderationStats.resolved_today}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                  <p className="text-2xl font-bold">{moderationStats.average_resolution_time}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Violation Types */}
      {moderationStats && (
        <Card>
          <CardHeader>
            <CardTitle>Top Violation Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moderationStats.top_violation_types.map((violation, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{violation.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(violation.count / moderationStats.top_violation_types[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {violation.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports, users, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="service">Services</SelectItem>
            <SelectItem value="event">Events</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Moderation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">Pending ({moderationStats?.pending_reports})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="escalated">Escalated</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'pending' 
                    ? 'No pending moderation items' 
                    : `No ${activeTab} items found`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(renderModerationItem)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Moderation Action</DialogTitle>
            <DialogDescription>
              Review and take action on the reported content
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {/* Content Preview */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Reported Content</h4>
                <p className="text-sm text-muted-foreground">{selectedItem.content}</p>
              </div>

              {/* Action Form */}
              <div className="space-y-4">
                <div>
                  <Label>Action</Label>
                  <Select defaultValue="approve">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                      <SelectItem value="escalate">Escalate</SelectItem>
                      <SelectItem value="warn">Warn User</SelectItem>
                      <SelectItem value="ban">Ban User</SelectItem>
                      <SelectItem value="delete">Delete Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Reason</Label>
                  <Input placeholder="Reason for this action..." />
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea placeholder="Additional notes for the moderation team..." rows={3} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Take Action
                </Button>
                <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
