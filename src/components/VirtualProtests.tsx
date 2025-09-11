import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { 
  Megaphone, 
  Users, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Building2,
  Tag,
  Send,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Shield,
  UserCheck,
  Globe,
  Target,
  Zap,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Share2,
  Flag,
  Eye,
  Calendar,
  Timer,
  Lock,
  Unlock,
  PenTool,
  FileText,
  Heart,
  ThumbsUp,
  ThumbsDown,
  TrendingDown,
  Users2,
  UserPlus,
  UserMinus,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  MoreHorizontal,
  ExternalLink,
  Download,
  Upload,
  Edit,
  Trash2,
  Copy,
  Link,
  Mail,
  Phone,
  MessageCircle,
  Bell,
  BellOff,
  StarOff,
  StarOn,
  Bookmark,
  BookmarkCheck,
  Archive,
  ArchiveRestore,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  RefreshCcw,
  RotateCw,
  RotateCcw2,
  Move,
  Move3D,
  Layers,
  Layers3,
  Box,
  Package,
  Database,
  Server,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryFull,
  Plug,
  PlugZap,
  Zap,
  ZapOff,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudHail,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake,
  TreePine,
  TreeDeciduous,
  Flower,
  Flower2,
  Leaf,
  LeafyGreen,
  Sprout,
  TreePineIcon,
  TreeDeciduousIcon,
  FlowerIcon,
  Flower2Icon,
  LeafIcon,
  LeafyGreenIcon,
  SproutIcon,
  TreePineIcon2,
  TreeDeciduousIcon2,
  FlowerIcon2,
  Flower2Icon2,
  LeafIcon2,
  LeafyGreenIcon2,
  SproutIcon2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface VirtualProtestsProps {
  className?: string;
}

interface VirtualProtest {
  id: string;
  title: string;
  description: string;
  issue_category: string;
  location: string;
  organizer_id: string;
  organizer_name: string;
  organizer_avatar?: string;
  target_authority_id?: string;
  target_authority_name?: string;
  status: 'active' | 'paused' | 'resolved' | 'cancelled';
  participants_count: number;
  signatures_count: number;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  community_impact_score: number;
  discussion_count: number;
  share_count: number;
  is_participant?: boolean;
  is_signed?: boolean;
  user_participation_type?: 'supporter' | 'organizer' | 'volunteer';
}

interface ProtestDiscussion {
  id: string;
  protest_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  likes_count: number;
  is_liked?: boolean;
}

const VirtualProtests: React.FC<VirtualProtestsProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useLocation();
  
  const [activeTab, setActiveTab] = useState<'active' | 'trending' | 'resolved' | 'my-protests'>('active');
  const [protests, setProtests] = useState<VirtualProtest[]>([]);
  const [discussions, setDiscussions] = useState<ProtestDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtest, setSelectedProtest] = useState<VirtualProtest | null>(null);
  const [showCreateProtest, setShowCreateProtest] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [expandedProtests, setExpandedProtests] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Create protest form state
  const [newProtest, setNewProtest] = useState({
    title: '',
    description: '',
    issue_category: '',
    target_authority: '',
    end_date: '',
    tags: [] as string[],
  });

  // Load protests
  const loadProtests = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('virtual_protests')
        .select(`
          *,
          profiles!left(
            full_name,
            avatar_url
          ),
          government_authorities!left(
            name
          ),
          virtual_protest_participants!left(
            user_id,
            participation_type
          ),
          virtual_protest_signatures!left(
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedProtests = data?.map(protest => {
        const isParticipant = protest.virtual_protest_participants?.some(
          (participant: any) => participant.user_id === user?.id
        );
        const isSigned = protest.virtual_protest_signatures?.some(
          (signature: any) => signature.user_id === user?.id
        );
        const userParticipationType = protest.virtual_protest_participants?.find(
          (participant: any) => participant.user_id === user?.id
        )?.participation_type;

        return {
          ...protest,
          organizer_name: protest.profiles?.full_name || 'Anonymous',
          organizer_avatar: protest.profiles?.avatar_url,
          target_authority_name: protest.government_authorities?.name,
          is_participant: isParticipant,
          is_signed: isSigned,
          user_participation_type: userParticipationType,
        };
      }) || [];

      setProtests(processedProtests);
    } catch (error) {
      console.error('Error loading protests:', error);
      toast({
        title: "Error",
        description: "Failed to load protests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Load protest discussions
  const loadDiscussions = useCallback(async (protestId: string) => {
    try {
      const { data, error } = await supabase
        .from('protest_discussions')
        .select(`
          *,
          profiles!left(
            full_name,
            avatar_url
          )
        `)
        .eq('protest_id', protestId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedDiscussions = data?.map(discussion => ({
        ...discussion,
        user_name: discussion.profiles?.full_name || 'Anonymous',
        user_avatar: discussion.profiles?.avatar_url,
      })) || [];

      setDiscussions(processedDiscussions);
    } catch (error) {
      console.error('Error loading discussions:', error);
    }
  }, []);

  useEffect(() => {
    loadProtests();
  }, [loadProtests]);

  const handleJoinProtest = async (protestId: string, participationType: 'supporter' | 'organizer' | 'volunteer' = 'supporter') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to join protests",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('virtual_protest_participants')
        .insert({
          protest_id: protestId,
          user_id: user.id,
          participation_type: participationType,
          anonymous: true
        });

      if (error) throw error;

      // Update local state
      setProtests(prev => prev.map(protest => 
        protest.id === protestId 
          ? { 
              ...protest, 
              is_participant: true,
              participants_count: protest.participants_count + 1,
              user_participation_type: participationType
            }
          : protest
      ));

      toast({
        title: "Joined protest",
        description: `You've joined as a ${participationType}`,
      });
    } catch (error) {
      console.error('Error joining protest:', error);
      toast({
        title: "Error",
        description: "Failed to join protest",
        variant: "destructive",
      });
    }
  };

  const handleLeaveProtest = async (protestId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('virtual_protest_participants')
        .delete()
        .eq('protest_id', protestId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setProtests(prev => prev.map(protest => 
        protest.id === protestId 
          ? { 
              ...protest, 
              is_participant: false,
              participants_count: Math.max(0, protest.participants_count - 1),
              user_participation_type: undefined
            }
          : protest
      ));

      toast({
        title: "Left protest",
        description: "You've left the protest",
      });
    } catch (error) {
      console.error('Error leaving protest:', error);
      toast({
        title: "Error",
        description: "Failed to leave protest",
        variant: "destructive",
      });
    }
  };

  const handleSignProtest = async (protestId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to sign protests",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('virtual_protest_signatures')
        .insert({
          protest_id: protestId,
          user_id: user.id,
          signature_data: {
            signed_at: new Date().toISOString(),
            anonymous: true
          },
          anonymous: true
        });

      if (error) throw error;

      // Update local state
      setProtests(prev => prev.map(protest => 
        protest.id === protestId 
          ? { 
              ...protest, 
              is_signed: true,
              signatures_count: protest.signatures_count + 1
            }
          : protest
      ));

      toast({
        title: "Signed protest",
        description: "Your signature has been recorded",
      });
    } catch (error) {
      console.error('Error signing protest:', error);
      toast({
        title: "Error",
        description: "Failed to sign protest",
        variant: "destructive",
      });
    }
  };

  const handleCreateProtest = async () => {
    if (!user || !newProtest.title.trim() || !newProtest.description.trim()) {
      toast({
        title: "Invalid protest",
        description: "Please provide a title and description",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('virtual_protests')
        .insert({
          title: newProtest.title.trim(),
          description: newProtest.description.trim(),
          issue_category: newProtest.issue_category,
          location: location?.city || 'Unknown',
          organizer_id: user.id,
          target_authority_id: newProtest.target_authority || null,
          status: 'active',
          end_date: newProtest.end_date || null,
          tags: newProtest.tags
        });

      if (error) throw error;

      // Reset form
      setNewProtest({
        title: '',
        description: '',
        issue_category: '',
        target_authority: '',
        end_date: '',
        tags: [],
      });

      setShowCreateProtest(false);
      loadProtests();

      toast({
        title: "Protest created",
        description: "Your virtual protest has been created successfully",
      });
    } catch (error) {
      console.error('Error creating protest:', error);
      toast({
        title: "Error",
        description: "Failed to create protest",
        variant: "destructive",
      });
    }
  };

  const handleStartDiscussion = async () => {
    if (!user || !selectedProtest || !newDiscussion.trim()) {
      return;
    }

    try {
      const { error } = await supabase
        .from('protest_discussions')
        .insert({
          protest_id: selectedProtest.id,
          user_id: user.id,
          content: newDiscussion.trim()
        });

      if (error) throw error;

      setNewDiscussion('');
      loadDiscussions(selectedProtest.id);
      toast({
        title: "Discussion started",
        description: "Your discussion has been posted",
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to start discussion",
        variant: "destructive",
      });
    }
  };

  const toggleProtestExpansion = (protestId: string) => {
    setExpandedProtests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(protestId)) {
        newSet.delete(protestId);
      } else {
        newSet.add(protestId);
      }
      return newSet;
    });
  };

  const filteredProtests = protests.filter(protest => {
    const matchesSearch = protest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || protest.issue_category === filterCategory;
    const matchesTab = 
      (activeTab === 'active' && protest.status === 'active') ||
      (activeTab === 'trending' && protest.participants_count > 50) ||
      (activeTab === 'resolved' && protest.status === 'resolved') ||
      (activeTab === 'my-protests' && protest.organizer_id === user?.id);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'infrastructure': 'bg-orange-100 text-orange-800',
      'environment': 'bg-green-100 text-green-800',
      'health': 'bg-red-100 text-red-800',
      'education': 'bg-blue-100 text-blue-800',
      'transport': 'bg-purple-100 text-purple-800',
      'safety': 'bg-yellow-100 text-yellow-800',
      'culture': 'bg-pink-100 text-pink-800',
      'economy': 'bg-indigo-100 text-indigo-800',
      'corruption': 'bg-red-100 text-red-800',
      'discrimination': 'bg-purple-100 text-purple-800',
      'housing': 'bg-brown-100 text-brown-800',
      'employment': 'bg-green-100 text-green-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isProtestExpired = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const getImpactLevel = (participantsCount: number) => {
    if (participantsCount >= 1000) return { level: 'High', color: 'text-red-600' };
    if (participantsCount >= 100) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Virtual Protests
          </h1>
          <p className="text-muted-foreground mt-1">
            Raise your voice for community issues and demand accountability
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location?.city || 'Your City'}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Megaphone className="h-3 w-3" />
            {protests.length} Protests
          </Badge>
          <Button onClick={() => setShowCreateProtest(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Start Protest
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search protests by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="infrastructure">Infrastructure</SelectItem>
            <SelectItem value="environment">Environment</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="transport">Transport</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="culture">Culture</SelectItem>
            <SelectItem value="economy">Economy</SelectItem>
            <SelectItem value="corruption">Corruption</SelectItem>
            <SelectItem value="discrimination">Discrimination</SelectItem>
            <SelectItem value="housing">Housing</SelectItem>
            <SelectItem value="employment">Employment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Resolved
          </TabsTrigger>
          <TabsTrigger value="my-protests" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            My Protests
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProtests.map((protest) => (
                <motion.div
                  key={protest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getCategoryColor(protest.issue_category)}>
                              {protest.issue_category}
                            </Badge>
                            <Badge className={getStatusColor(protest.status)}>
                              {protest.status}
                            </Badge>
                            {protest.target_authority_name && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {protest.target_authority_name}
                              </Badge>
                            )}
                            {isProtestExpired(protest.end_date) && (
                              <Badge variant="destructive">
                                <Timer className="h-3 w-3 mr-1" />
                                Expired
                              </Badge>
                            )}
                          </div>
                          
                          <CardTitle className="text-lg leading-tight">
                            {protest.title}
                          </CardTitle>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(protest.created_at), { addSuffix: true })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {protest.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {protest.participants_count} participants
                            </div>
                            <div className="flex items-center gap-1">
                              <PenTool className="h-3 w-3" />
                              {protest.signatures_count} signatures
                            </div>
                            {protest.end_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Ends {format(new Date(protest.end_date), 'MMM dd')}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={protest.organizer_avatar} />
                            <AvatarFallback>
                              {protest.organizer_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-base">
                        {expandedProtests.has(protest.id) ? protest.description : protest.description.substring(0, 200) + '...'}
                      </CardDescription>
                      
                      {protest.description.length > 200 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleProtestExpansion(protest.id)}
                          className="p-0 h-auto text-blue-600 hover:text-blue-800"
                        >
                          {expandedProtests.has(protest.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Read more
                            </>
                          )}
                        </Button>
                      )}
                      
                      {/* Impact Metrics */}
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {protest.participants_count}
                          </div>
                          <div className="text-sm text-muted-foreground">Participants</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {protest.signatures_count}
                          </div>
                          <div className="text-sm text-muted-foreground">Signatures</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProtest(protest);
                              setShowDiscussion(true);
                              loadDiscussions(protest.id);
                            }}
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <MessageSquare className="h-4 w-4" />
                            {protest.discussion_count}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <Share2 className="h-4 w-4" />
                            {protest.share_count}
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {protest.is_participant ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLeaveProtest(protest.id)}
                              className="flex items-center gap-2 text-red-600 hover:text-red-800"
                            >
                              <UserMinus className="h-4 w-4" />
                              Leave
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleJoinProtest(protest.id)}
                              className="flex items-center gap-2"
                            >
                              <UserPlus className="h-4 w-4" />
                              Join
                            </Button>
                          )}
                          
                          {!protest.is_signed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSignProtest(protest.id)}
                              className="flex items-center gap-2"
                            >
                              <PenTool className="h-4 w-4" />
                              Sign
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProtest(protest);
                              setShowDiscussion(true);
                              loadDiscussions(protest.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Discuss
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Protest Dialog */}
      <Dialog open={showCreateProtest} onOpenChange={setShowCreateProtest}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Start Virtual Protest</DialogTitle>
            <DialogDescription>
              Create a virtual protest to raise awareness about community issues
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Protest Title *</label>
                <Input
                  placeholder="What issue are you protesting about?"
                  value={newProtest.title}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Describe the issue, why it matters, and what change you want to see..."
                  value={newProtest.description}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Issue Category *</label>
                  <Select value={newProtest.issue_category} onValueChange={(value) => setNewProtest(prev => ({ ...prev, issue_category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="corruption">Corruption</SelectItem>
                      <SelectItem value="discrimination">Discrimination</SelectItem>
                      <SelectItem value="housing">Housing</SelectItem>
                      <SelectItem value="employment">Employment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Authority (Optional)</label>
                  <Input
                    placeholder="e.g., Municipal Corporation, Health Department"
                    value={newProtest.target_authority}
                    onChange={(e) => setNewProtest(prev => ({ ...prev, target_authority: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date (Optional)</label>
                <Input
                  type="datetime-local"
                  value={newProtest.end_date}
                  onChange={(e) => setNewProtest(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateProtest(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProtest} disabled={!newProtest.title.trim() || !newProtest.description.trim()}>
              <Megaphone className="h-4 w-4 mr-2" />
              Start Protest
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discussion Dialog */}
      <Dialog open={showDiscussion} onOpenChange={setShowDiscussion}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Protest Discussion</DialogTitle>
            <DialogDescription>
              {selectedProtest?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* New Discussion Form */}
            <div className="space-y-2">
              <Textarea
                placeholder="Share your thoughts, experiences, or suggestions about this protest..."
                value={newDiscussion}
                onChange={(e) => setNewDiscussion(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleStartDiscussion} disabled={!newDiscussion.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post Discussion
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Existing Discussions */}
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <Card key={discussion.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={discussion.user_avatar} />
                          <AvatarFallback>
                            {discussion.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {discussion.user_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-sm">{discussion.content}</p>
                          
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {discussion.likes_count}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VirtualProtests;
