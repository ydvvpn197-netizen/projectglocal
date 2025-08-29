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
  Edit, 
  Trash2, 
  Share2, 
  Calendar,
  User,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { LifeWish } from '@/services/lifeWishService';
import { formatDistanceToNow } from 'date-fns';

interface LifeWishCardProps {
  wish: LifeWish;
  showUserInfo?: boolean;
  onEdit?: (wish: LifeWish) => void;
  onDelete?: (wishId: string) => void;
  onShare?: (wish: LifeWish) => void;
  isOwner?: boolean;
  className?: string;
}

export const LifeWishCard: React.FC<LifeWishCardProps> = ({
  wish,
  showUserInfo = false,
  onEdit,
  onDelete,
  onShare,
  isOwner = false,
  className = ''
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this life wish? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete?.(wish.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const truncatedContent = wish.content.length > 200 
    ? wish.content.substring(0, 200) + '...' 
    : wish.content;

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {showUserInfo && (
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
                {wish.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
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
            </div>
          </div>

          {/* Action Menu */}
          {isOwner && (
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
                    </div>
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

              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(wish)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}

              {onShare && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onShare(wish)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              )}

              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
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
            <div className="flex items-center gap-1 text-primary/60">
              <Heart className="w-4 h-4" />
              <span className="text-sm">A life wish shared with love</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Special card for community memorial space
export const MemorialLifeWishCard: React.FC<LifeWishCardProps> = (props) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg -z-10" />
      <LifeWishCard
        {...props}
        className="bg-white/80 backdrop-blur-sm border-primary/30"
      />
    </div>
  );
};

// Compact card for lists
export const CompactLifeWishCard: React.FC<LifeWishCardProps> = ({
  wish,
  onEdit,
  onDelete,
  isOwner = false,
  ...props
}) => {
  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-800 truncate group-hover:text-primary transition-colors">
              {wish.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {wish.content}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                className="text-xs"
              >
                {getVisibilityLabel(wish.visibility)}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(wish.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(wish)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDelete(wish.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function for visibility label
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
