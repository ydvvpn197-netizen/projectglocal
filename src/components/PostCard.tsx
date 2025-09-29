import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Bookmark,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Star,
  Eye,
  Clock,
  MapPin,
  Users,
  Calendar,
  Tag,
  Hash,
  AtSign,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Link,
  Navigation,
  Compass,
  Flag as FlagIcon,
  Tag as TagIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  DollarSign as DollarSignIcon,
  CreditCard as CreditCardIcon,
  Wallet as WalletIcon,
  PiggyBank as PiggyBankIcon,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon,
  User,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UserCog,
  UserEdit,
  UserSearch,
  UserStar,
  UserHeart,
  UserMessage,
  UserPhone,
  UserMail,
  UserCalendar,
  UserClock,
  UserMap,
  UserHome,
  UserWork,
  UserSchool,
  UserGame,
  UserMusic,
  UserArt,
  UserSport,
  UserFood,
  UserTravel,
  UserTech,
  UserHealth,
  UserFinance,
  UserShopping,
  UserGift,
  UserParty,
  UserSun,
  UserMoon,
  UserCloud,
  UserRain,
  UserSnow,
  UserWind,
  UserDroplet,
  UserThermometer,
  UserEye,
  UserSearch as UserSearchIcon,
  UserFilter,
  UserGrid,
  UserList,
  UserMore,
  UserSettings,
  UserBell,
  UserMail as UserMailIcon,
  UserPhone as UserPhoneIcon,
  UserMap as UserMapIcon,
  UserNavigation,
  UserCompass,
  UserFlag,
  UserTag,
  UserHash,
  UserAtSign,
  UserDollarSign,
  UserCreditCard,
  UserWallet,
  UserPiggyBank,
  UserTrendingDown,
  UserActivity
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
      verified?: boolean;
    };
    created_at: string;
    updated_at?: string;
    likes_count?: number;
    comments_count?: number;
    shares_count?: number;
    views_count?: number;
    category?: string;
    tags?: string[];
    image_url?: string;
    is_liked?: boolean;
    is_bookmarked?: boolean;
    is_pinned?: boolean;
    is_featured?: boolean;
    location?: string;
    privacy?: 'public' | 'private' | 'friends';
    type?: 'text' | 'image' | 'video' | 'link' | 'poll';
    poll_data?: {
      question: string;
      options: string[];
      votes: number[];
      total_votes: number;
      end_date?: string;
    };
    link_data?: {
      url: string;
      title: string;
      description: string;
      image: string;
      domain: string;
    };
  };
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onFollow?: (authorId: string) => void;
  onVote?: (postId: string, optionIndex: number) => void;
  verified?: boolean;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onReport,
  onFollow,
  onVote,
  verified = false,
  showActions = true,
  variant = 'default',
  className = ''
}) => {
  const handleLike = () => {
    if (onLike) {
      onLike(post.id);
    }
  };

  const handleComment = () => {
    if (onComment) {
      onComment(post.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post.id);
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(post.id);
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport(post.id);
    }
  };

  const handleFollow = () => {
    if (onFollow) {
      onFollow(post.author.id);
    }
  };

  const handleVote = (optionIndex: number) => {
    if (onVote) {
      onVote(post.id, optionIndex);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

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
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{post.author.name}</h3>
                  {post.author.verified && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.content}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {post.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {post.comments_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {post.shares_count || 0}
                  </span>
                </div>
              </div>
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
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{post.author.name}</h3>
                  {post.author.verified && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(post.created_at)}
                  {post.location && (
                    <>
                      {' • '}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleFollow}>
                  <UserPlus className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
              <p className="text-muted-foreground">{post.content}</p>
            </div>

            {post.image_url && (
              <img 
                src={post.image_url} 
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            {post.poll_data && (
              <div className="space-y-3">
                <h5 className="font-semibold">{post.poll_data.question}</h5>
                <div className="space-y-2">
                  {post.poll_data.options.map((option, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{option}</span>
                        <span className="text-xs text-muted-foreground">
                          {post.poll_data.votes[index]} votes
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(post.poll_data.votes[index] / post.poll_data.total_votes) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {post.link_data && (
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex gap-3">
                  <img 
                    src={post.link_data.image} 
                    alt={post.link_data.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm">{post.link_data.title}</h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {post.link_data.description}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">{post.link_data.domain}</p>
                  </div>
                </div>
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLike}
                  className={post.is_liked ? 'text-red-500' : ''}
                >
                  <Heart className={`w-4 h-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                  {post.likes_count || 0}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleComment}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {post.comments_count || 0}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-1" />
                  {post.shares_count || 0}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBookmark}
                  className={post.is_bookmarked ? 'text-yellow-500' : ''}
                >
                  <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReport}>
                  <Flag className="w-4 h-4" />
                </Button>
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
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{post.author.name}</h3>
                  {post.author.verified && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(post.created_at)}
                  {post.location && (
                    <>
                      {' • '}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-1">{post.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {post.content}
              </p>
            </div>

            {post.image_url && (
              <img 
                src={post.image_url} 
                alt={post.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLike}
                  className={post.is_liked ? 'text-red-500' : ''}
                >
                  <Heart className={`w-4 h-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                  {post.likes_count || 0}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleComment}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {post.comments_count || 0}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-1" />
                  {post.shares_count || 0}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBookmark}
                  className={post.is_bookmarked ? 'text-yellow-500' : ''}
                >
                  <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReport}>
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export { PostCard };
export default PostCard;
