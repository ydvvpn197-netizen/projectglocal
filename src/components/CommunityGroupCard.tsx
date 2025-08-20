import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageSquare, 
  MapPin, 
  Calendar,
  Lock,
  Globe
} from 'lucide-react';
import { CommunityGroup } from '@/types/community';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityGroups } from '@/hooks/useCommunityGroups';

interface CommunityGroupCardProps {
  group: CommunityGroup;
  showJoinButton?: boolean;
  showStats?: boolean;
  className?: string;
}

export const CommunityGroupCard: React.FC<CommunityGroupCardProps> = ({
  group,
  showJoinButton = true,
  showStats = true,
  className
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinGroup, leaveGroup, isGroupMember, getUserRole } = useCommunityGroups();
  const [isMember, setIsMember] = React.useState(false);
  const [userRole, setUserRole] = React.useState<'admin' | 'moderator' | 'member' | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const checkMembership = async () => {
      if (user) {
        const member = await isGroupMember(group.id);
        const role = await getUserRole(group.id);
        setIsMember(member);
        setUserRole(role);
      }
    };
    checkMembership();
  }, [user, group.id, isGroupMember, getUserRole]);

  const handleJoinLeave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (isMember) {
        await leaveGroup(group.id);
        setIsMember(false);
        setUserRole(null);
      } else {
        await joinGroup(group.id);
        setIsMember(true);
        setUserRole('member');
      }
    } catch (error) {
      console.error('Error joining/leaving group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = () => {
    navigate(`/group/${group.id}`);
  };

  const getRoleBadge = () => {
    if (!userRole) return null;

    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      moderator: 'bg-orange-100 text-orange-800',
      member: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={roleColors[userRole]}>
        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
      </Badge>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'general': 'bg-gray-100 text-gray-800',
      'technology': 'bg-blue-100 text-blue-800',
      'entertainment': 'bg-purple-100 text-purple-800',
      'sports': 'bg-green-100 text-green-800',
      'news': 'bg-red-100 text-red-800',
      'lifestyle': 'bg-pink-100 text-pink-800',
      'education': 'bg-yellow-100 text-yellow-800',
      'business': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category.toLowerCase()] || colors.general;
  };

  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      onClick={handleGroupClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${group.name}`} />
              <AvatarFallback className="text-lg font-semibold">
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  r/{group.name}
                </h3>
                
                {!group.is_public && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}

                {group.is_public && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}

                {getRoleBadge()}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {group.description || 'No description available'}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <Badge className={getCategoryColor(group.category)}>
                  {group.category}
                </Badge>

                {group.location_city && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {group.location_city}
                    {group.location_state && `, ${group.location_state}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {showJoinButton && (
            <Button
              variant={isMember ? "outline" : "default"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleJoinLeave();
              }}
              disabled={loading}
              className="flex-shrink-0"
            >
              {loading ? '...' : isMember ? 'Leave' : 'Join'}
            </Button>
          )}
        </div>
      </CardHeader>

      {showStats && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {group.member_count} members
              </div>
              
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {group.post_count} posts
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
