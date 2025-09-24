import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Star, 
  Heart,
  Share2,
  MoreHorizontal,
  Crown,
  Shield,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CommunityGroup } from '@/types/community';

interface CommunityCardProps {
  community: CommunityGroup;
  isMember: boolean;
  onJoin: (groupId: string) => Promise<void>;
  joiningGroup: string | null;
  viewMode: 'grid' | 'list';
}

export const CommunityCard: React.FC<CommunityCardProps> = memo(({
  community,
  isMember,
  onJoin,
  joiningGroup,
  viewMode
}) => {
  const isJoining = joiningGroup === community.id;

  const handleJoinClick = async () => {
    await onJoin(community.id);
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${community.name}`} />
                <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold truncate">{community.name}</h3>
                  {community.is_public ? (
                    <Badge variant="secondary">Public</Badge>
                  ) : (
                    <Badge variant="outline">Private</Badge>
                  )}
                </div>
                
                {community.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {community.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{community.member_count || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{community.post_count || 0} posts</span>
                  </div>
                  {community.location_city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{community.location_city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {isMember ? (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/community/${community.id}`}>
                    View Community
                  </Link>
                </Button>
              ) : (
                <Button 
                  onClick={handleJoinClick}
                  disabled={isJoining}
                  size="sm"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Community'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${community.name}`} />
              <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{community.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {community.is_public ? (
                  <Badge variant="secondary" className="text-xs">Public</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Private</Badge>
                )}
                <Badge variant="outline" className="text-xs">{community.category}</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {community.description && (
          <CardDescription className="text-sm mb-4 line-clamp-2">
            {community.description}
          </CardDescription>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{community.member_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{community.post_count || 0}</span>
          </div>
          {community.location_city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{community.location_city}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {isMember ? (
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to={`/community/${community.id}`}>
                View Community
              </Link>
            </Button>
          ) : (
            <Button 
              onClick={handleJoinClick}
              disabled={isJoining}
              size="sm"
              className="flex-1"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Community'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
