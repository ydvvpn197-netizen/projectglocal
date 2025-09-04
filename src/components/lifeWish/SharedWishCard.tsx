import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Heart, 
  Lock, 
  Globe, 
  Users, 
  Shield, 
  Share2, 
  Calendar,
  User,
  Eye,
  Gift
} from 'lucide-react';
import { LifeWish } from '@/services/lifeWishService';
import { formatDistanceToNow } from 'date-fns';
import { LifeWishShareDialog } from './LifeWishShareDialog';

interface SharedWishCardProps {
  wish: LifeWish;
  sharedBy?: {
    id: string;
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
  sharedAt?: string;
  permissions?: Record<string, unknown>;
  onShare?: (wish: LifeWish) => void;
  className?: string;
}

export const SharedWishCard: React.FC<SharedWishCardProps> = ({
  wish,
  sharedBy,
  sharedAt,
  permissions,
  onShare,
  className = ''
}) => {
  const [showFullContent, setShowFullContent] = useState(false);

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'public':
        return <Globe className="w-4 h-4" />;
      case 'family':
        return <Users className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'public':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'family':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return 'Private';
      case 'public':
        return 'Public';
      case 'family':
        return 'Family';
      default:
        return 'Private';
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const truncatedContent = wish.content.length > 200 
    ? wish.content.substring(0, 200) + '...' 
    : wish.content;

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-2 border-green-200 hover:border-green-300 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={sharedBy?.avatar_url} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
                  {wish.title}
                </h3>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
                  <Gift className="w-3 h-3 mr-1" />
                  Shared
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`${getVisibilityColor(wish.visibility)} text-xs`}
                >
                  {getVisibilityIcon(wish.visibility)}
                  <span className="ml-1">{getVisibilityLabel(wish.visibility)}</span>
                </Badge>
                {wish.is_encrypted && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                )}
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(wish.created_at)}
                </span>
              </div>
              {sharedBy && (
                <div className="text-xs text-gray-500 mt-1">
                  Shared by <span className="font-medium">{sharedBy.display_name || sharedBy.username || 'Unknown User'}</span>
                  {sharedAt && ` ${formatDate(sharedAt)}`}
                </div>
              )}
            </div>
          </div>

          {/* Action Menu */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    {wish.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getVisibilityIcon(wish.visibility)}
                    <Badge className={getVisibilityColor(wish.visibility)}>
                      {getVisibilityLabel(wish.visibility)}
                    </Badge>
                    {wish.is_encrypted && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        <Shield className="w-3 h-3 mr-1" />
                        Encrypted
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      <Gift className="w-3 h-3 mr-1" />
                      Shared
                    </Badge>
                  </div>
                  {sharedBy && (
                    <div className="text-sm text-gray-600">
                      Shared by <span className="font-medium">{sharedBy.display_name || sharedBy.username || 'Unknown User'}</span>
                      {sharedAt && ` ${formatDate(sharedAt)}`}
                    </div>
                  )}
                  <Separator />
                  <div className="prose max-w-none">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border border-gray-200">
                      <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
                        {wish.content}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 text-center">
                    Created {formatDate(wish.created_at)}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Share Button - if user has permission */}
            {permissions?.canShare && (
              <LifeWishShareDialog wish={wish} onShare={() => onShare?.(wish)}>
                <Button 
                  variant="ghost" 
                  size="sm"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </LifeWishShareDialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {showFullContent ? wish.content : truncatedContent}
            </p>
            {wish.content.length > 200 && (
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:text-primary/80"
                onClick={() => setShowFullContent(!showFullContent)}
              >
                {showFullContent ? 'Show less' : 'Read more'}
              </Button>
            )}
          </div>

          {/* Emotional Design Elements */}
          <div className="flex items-center justify-center pt-2">
            <div className="flex items-center gap-1 text-green-600">
              <Heart className="w-4 h-4" />
              <span className="text-sm">A life wish shared with love</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
