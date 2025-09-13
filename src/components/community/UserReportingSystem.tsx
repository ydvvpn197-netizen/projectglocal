import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Flag, 
  AlertTriangle, 
  Shield, 
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

interface Report {
  id: string;
  type: 'post' | 'comment' | 'user' | 'service' | 'event' | 'message';
  target_id: string;
  target_content: string;
  reason: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed' | 'escalated';
  reporter: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  target_author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
  resolution?: {
    action: string;
    notes: string;
    resolved_by: string;
    resolved_at: string;
  };
}

interface ReportForm {
  type: string;
  target_id: string;
  reason: string;
  description: string;
  severity: string;
  evidence?: string[];
}

interface UserReportingSystemProps {
  targetId?: string;
  targetType?: string;
  onReportSubmit?: (report: Report) => void;
}

export function UserReportingSystem({ 
  targetId, 
  targetType, 
  onReportSubmit 
}: UserReportingSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my_reports');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportForm, setReportForm] = useState<ReportForm>({
    type: targetType || 'post',
    target_id: targetId || '',
    reason: '',
    description: '',
    severity: 'medium',
    evidence: []
  });

  const reportReasons = [
    { value: 'spam', label: 'Spam or Scam', description: 'Promotional content or fraudulent activity' },
    { value: 'harassment', label: 'Harassment or Bullying', description: 'Targeted abuse or intimidation' },
    { value: 'inappropriate', label: 'Inappropriate Content', description: 'Content that violates community guidelines' },
    { value: 'fake', label: 'Fake Information', description: 'Misleading or false information' },
    { value: 'copyright', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted material' },
    { value: 'privacy', label: 'Privacy Violation', description: 'Sharing personal information without consent' },
    { value: 'violence', label: 'Violence or Threats', description: 'Content promoting violence or making threats' },
    { value: 'hate_speech', label: 'Hate Speech', description: 'Content promoting hatred or discrimination' },
    { value: 'other', label: 'Other', description: 'Other violations not listed above' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', description: 'Minor violation, warning may be sufficient' },
    { value: 'medium', label: 'Medium', description: 'Moderate violation, content review needed' },
    { value: 'high', label: 'High', description: 'Serious violation, immediate action required' },
    { value: 'critical', label: 'Critical', description: 'Severe violation, urgent attention needed' }
  ];

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const loadReports = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          *,
          profiles!user_reports_reporter_id_fkey(
            id,
            display_name,
            avatar_url
          ),
          target_profiles:profiles!user_reports_target_author_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReports: Report[] = (data || []).map(report => ({
        id: report.id,
        type: report.type,
        target_id: report.target_id,
        target_content: report.target_content,
        reason: report.reason,
        description: report.description,
        severity: report.severity,
        status: report.status,
        reporter: {
          id: report.profiles?.id,
          display_name: report.profiles?.display_name || 'Unknown',
          avatar_url: report.profiles?.avatar_url
        },
        target_author: {
          id: report.target_profiles?.id,
          display_name: report.target_profiles?.display_name || 'Unknown',
          avatar_url: report.target_profiles?.avatar_url
        },
        created_at: report.created_at,
        updated_at: report.updated_at,
        resolution: report.resolution
      }));

      setReports(formattedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your reports',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const submitReport = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to submit a report',
        variant: 'destructive'
      });
      return;
    }

    if (!reportForm.reason || !reportForm.description.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a reason and description for your report',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_reports')
        .insert({
          type: reportForm.type,
          target_id: reportForm.target_id,
          reason: reportForm.reason,
          description: reportForm.description.trim(),
          severity: reportForm.severity,
          reporter_id: user.id,
          status: 'pending',
          evidence: reportForm.evidence || []
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Report Submitted',
        description: 'Thank you for your report. We will review it and take appropriate action.',
      });

      setShowReportDialog(false);
      setReportForm({
        type: targetType || 'post',
        target_id: targetId || '',
        reason: '',
        description: '',
        severity: 'medium',
        evidence: []
      });

      loadReports();
      onReportSubmit?.(data);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Report Failed',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'dismissed': return 'text-gray-600 bg-gray-100';
      case 'escalated': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return FileText;
      case 'comment': return MessageSquare;
      case 'user': return User;
      case 'service': return Star;
      case 'event': return Calendar;
      case 'message': return MessageSquare;
      default: return Flag;
    }
  };

  const filteredReports = reports.filter(report => {
    if (activeTab === 'my_reports') return true;
    return report.status === activeTab;
  });

  const renderReportCard = (report: Report) => {
    const TypeIcon = getTypeIcon(report.type);

    return (
      <Card key={report.id} className="group hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-muted">
              <TypeIcon className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {reportReasons.find(r => r.value === report.reason)?.label || report.reason}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{report.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(report.severity)}>
                    {report.severity}
                  </Badge>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <span>Reported {report.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {report.resolution && (
                <div className="bg-muted p-3 rounded-lg mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Resolution</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{report.resolution.notes}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Resolved on {new Date(report.resolution.resolved_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                {report.status === 'pending' && (
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Report
                  </Button>
                )}
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
          <div className="text-center">Loading reports...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Content</h2>
          <p className="text-muted-foreground">
            Help keep our community safe by reporting inappropriate content
          </p>
        </div>
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogTrigger asChild>
            <Button>
              <Flag className="h-4 w-4 mr-2" />
              Submit Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit a Report</DialogTitle>
              <DialogDescription>
                Help us maintain a safe and respectful community environment
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Report Type */}
              <div>
                <Label>What are you reporting?</Label>
                <Select 
                  value={reportForm.type} 
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="user">User Profile</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Report Reason */}
              <div>
                <Label>Reason for reporting</Label>
                <Select 
                  value={reportForm.reason} 
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, reason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        <div>
                          <div className="font-medium">{reason.label}</div>
                          <div className="text-sm text-muted-foreground">{reason.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Severity Level */}
              <div>
                <Label>Severity Level</Label>
                <Select 
                  value={reportForm.severity} 
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-muted-foreground">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label>Additional Details</Label>
                <Textarea
                  placeholder="Please provide specific details about the violation. Include relevant context that will help our moderation team understand the issue."
                  value={reportForm.description}
                  onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Target ID (if not provided) */}
              {!targetId && (
                <div>
                  <Label>Content ID or URL</Label>
                  <Input
                    placeholder="Enter the ID or URL of the content you're reporting"
                    value={reportForm.target_id}
                    onChange={(e) => setReportForm(prev => ({ ...prev, target_id: e.target.value }))}
                  />
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                      What happens next?
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Your report will be reviewed by our moderation team</li>
                      <li>• We'll investigate the reported content within 24 hours</li>
                      <li>• You'll receive updates on the status of your report</li>
                      <li>• All reports are confidential and anonymous</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={submitReport} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="my_reports">My Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'my_reports' 
                    ? 'You haven\'t submitted any reports yet' 
                    : `No ${activeTab.replace('_', ' ')} reports`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReports.map(renderReportCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Community Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">What to Report</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Spam or promotional content</li>
                  <li>• Harassment or bullying</li>
                  <li>• Inappropriate or offensive content</li>
                  <li>• Fake information or scams</li>
                  <li>• Copyright violations</li>
                  <li>• Privacy violations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">What NOT to Report</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Disagreements or different opinions</li>
                  <li>• Content you simply don't like</li>
                  <li>• Personal disputes</li>
                  <li>• Legitimate business content</li>
                  <li>• Creative expression within guidelines</li>
                  <li>• Constructive criticism</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
