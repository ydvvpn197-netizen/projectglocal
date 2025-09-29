import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Star, 
  Heart, 
  Share2, 
  MoreHorizontal,
  MessageCircle,
  UserPlus,
  UserMinus,
  CheckCircle,
  Lock,
  Globe,
  Activity,
  TrendingUp,
  Award,
  Crown,
  Sparkles,
  Zap,
  Target,
  Award as AwardIcon,
  Crown as CrownIcon,
  Sparkles as SparklesIcon,
  Zap as ZapIcon,
  Target as TargetIcon,
  Shield as ShieldIcon,
  Lightbulb as LightbulbIcon,
  Rocket as RocketIcon,
  CheckCircle as CheckCircleIcon,
  BarChart3 as BarChart3Icon,
  UserPlus as UserPlusIcon,
  BookOpen as BookOpenIcon,
  Megaphone as MegaphoneIcon,
  Building2 as Building2Icon,
  TreePine as TreePineIcon,
  Music as MusicIcon,
  Palette as PaletteIcon,
  Utensils as UtensilsIcon,
  Dumbbell as DumbbellIcon,
  GraduationCap as GraduationCapIcon,
  Briefcase as BriefcaseIcon,
  Gamepad2 as Gamepad2Icon,
  Camera as CameraIcon,
  Car as CarIcon,
  Home as HomeIcon,
  Wifi as WifiIcon,
  Smartphone as SmartphoneIcon,
  Laptop as LaptopIcon,
  Headphones as HeadphonesIcon,
  Coffee as CoffeeIcon,
  ShoppingBag as ShoppingBagIcon,
  Gift as GiftIcon,
  PartyPopper as PartyPopperIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Cloud as CloudIcon,
  CloudRain as CloudRainIcon,
  Snowflake as SnowflakeIcon,
  Wind as WindIcon,
  Droplets as DropletsIcon,
  Thermometer as ThermometerIcon,
  Eye as EyeIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Grid3X3 as Grid3X3Icon,
  List as ListIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Map as MapIcon,
  Navigation as NavigationIcon,
  Compass as CompassIcon,
  Flag as FlagIcon,
  Tag as TagIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  DollarSign as DollarSignIcon,
  CreditCard as CreditCardIcon,
  Wallet as WalletIcon,
  PiggyBank as PiggyBankIcon,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string;
    image_url?: string;
    image?: string;
    category: string;
    location?: string;
    member_count?: number;
    members?: number;
    creator_name?: string;
    creator_avatar?: string;
    creator?: {
      name: string;
      avatar: string;
    };
    is_verified?: boolean;
    activity_level?: string;
    activity_score?: number;
    created_at?: string;
    createdAt?: string;
    tags?: string[];
    is_private?: boolean;
    is_featured?: boolean;
    rules?: string[];
    guidelines?: string[];
    contact_info?: {
      email?: string;
      phone?: string;
      website?: string;
    };
  };
  onJoin?: (communityId: string) => void;
  onLeave?: (communityId: string) => void;
  onChat?: (communityId: string, organizerId: string) => void;
  onShare?: (communityId: string) => void;
  onFollow?: (communityId: string) => void;
  verified?: boolean;
  isJoined?: boolean;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  onJoin,
  onLeave,
  onChat,
  onShare,
  onFollow,
  verified = false,
  isJoined = false,
  showActions = true,
  variant = 'default',
  className = ''
}) => {
  const handleJoin = () => {
    if (onJoin) {
      onJoin(community.id);
    }
  };

  const handleLeave = () => {
    if (onLeave) {
      onLeave(community.id);
    }
  };

  const handleChat = () => {
    if (onChat) {
      onChat(community.id, community.creator_name || '');
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(community.id);
    }
  };

  const handleFollow = () => {
    if (onFollow) {
      onFollow(community.id);
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      'Music': Music,
      'Art': Palette,
      'Community': Users,
      'Food': Utensils,
      'Technology': Laptop,
      'Health & Wellness': Dumbbell,
      'Sports': Target,
      'Education': GraduationCap,
      'Business': Briefcase,
      'Entertainment': PartyPopper,
      'Gaming': Gamepad2,
      'Photography': Camera,
      'Travel': Car,
      'Home': Home,
      'Tech': Wifi,
      'Mobile': Smartphone,
      'Computing': Laptop,
      'Audio': Headphones,
      'Food & Drink': Coffee,
      'Shopping': ShoppingBag,
      'Gifts': Gift,
      'Celebration': PartyPopper,
      'Weather': Sun,
      'Night': Moon,
      'Cloud': Cloud,
      'Rain': CloudRain,
      'Snow': Snowflake,
      'Wind': Wind,
      'Water': Droplets,
      'Temperature': Thermometer,
      'Vision': Eye,
      'Search': Search,
      'Filter': Filter,
      'Grid': Grid3X3,
      'List': List,
      'More': MoreHorizontal,
      'Settings': Settings,
      'Notifications': Bell,
      'Email': Mail,
      'Phone': Phone,
      'Map': Map,
      'Navigation': Navigation,
      'Compass': Compass,
      'Flag': Flag,
      'Tag': Tag,
      'Hash': Hash,
      'At': AtSign,
      'Money': DollarSign,
      'Card': CreditCard,
      'Wallet': Wallet,
      'Piggy': PiggyBank,
      'Trending': TrendingDown,
      'Activity': Activity
    };
    
    return iconMap[category] || Users;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Music': 'bg-purple-500',
      'Art': 'bg-pink-500',
      'Community': 'bg-blue-500',
      'Food': 'bg-orange-500',
      'Technology': 'bg-indigo-500',
      'Health & Wellness': 'bg-green-500',
      'Sports': 'bg-red-500',
      'Education': 'bg-yellow-500',
      'Business': 'bg-gray-600',
      'Entertainment': 'bg-pink-600'
    };
    
    return colorMap[category] || 'bg-gray-500';
  };

  const CategoryIcon = getCategoryIcon(community.category);
  const categoryColor = getCategoryColor(community.category);

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`group cursor-pointer ${className}`}
      >
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${categoryColor} rounded-lg flex items-center justify-center`}>
                <CategoryIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{community.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{community.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {community.member_count || community.members || 0} members
                  </span>
                  {community.is_verified && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              {showActions && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isJoined ? handleLeave : handleJoin}
                  >
                    {isJoined ? (
                      <UserMinus className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className={`group cursor-pointer ${className}`}
      >
        <Card className="hover:shadow-lg transition-all duration-300">
          <div className="relative">
            <img 
              src={community.image_url || community.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop"} 
              alt={community.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="absolute top-4 right-4">
              <Badge className="bg-white/90 text-black">
                {community.category}
              </Badge>
            </div>
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-2 text-white">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {community.member_count || community.members || 0} members
                </span>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-xl flex items-center gap-2">
                  {community.name}
                  {community.is_verified && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {community.description}
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {community.location || "Online"}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {community.activity_level || "Active"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(community.created_at || community.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              {community.tags && community.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {community.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {community.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{community.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={community.creator_avatar || community.creator?.avatar} />
                    <AvatarFallback>{(community.creator_name || community.creator?.name || 'C')[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {community.creator_name || community.creator?.name || 'Community Creator'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isJoined ? handleLeave : handleJoin}
                  >
                    {isJoined ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-1" />
                        Leave
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Join
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleChat}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`group cursor-pointer ${className}`}
    >
      <Card className="hover:shadow-lg transition-all duration-300">
        <div className="relative">
          <img 
            src={community.image_url || community.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop"} 
            alt={community.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/90 text-black">
              {community.category}
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2 text-white">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {community.member_count || community.members || 0} members
              </span>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {community.name}
                {community.is_verified && (
                  <Badge className="bg-blue-500 text-white text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {community.description}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={community.creator_avatar || community.creator?.avatar} />
                  <AvatarFallback>{(community.creator_name || community.creator?.name || 'C')[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {community.creator_name || community.creator?.name || 'Community Creator'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isJoined ? handleLeave : handleJoin}
                >
                  {isJoined ? (
                    <UserMinus className="w-4 h-4 mr-1" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-1" />
                  )}
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export { CommunityCard };
export default CommunityCard;
