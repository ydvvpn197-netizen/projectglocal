import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Star,
  Plus,
  Minus,
  Eye,
  Settings
} from 'lucide-react';
import { CommunityGroup } from '@/types/community';
import { useCommunityGroups } from '@/hooks/useCommunityGroups';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface CommunityGroupCardProps {
  group: CommunityGroup;
  className?: string;
  showActions?: boolean;
  variant?: 'default' | 'featured' | 'compact';
}

export const CommunityGroupCard = ({ 
  group, 
  className = '',
  showActions = true,
  variant = 'default'
}: CommunityGroupCardProps) => {
  const { user } = useAuth();
  const { joinGroup, leaveGroup, isGroupMember, getUserRole } = useCommunityGroups();
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'moderator' | 'member' | null>(null);
  const [loading, setLoading] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(true);

  // Check membership status
  useEffect(() => {
    const checkMembership = async () => {
      if (!user) {
        setIsMember(false);
        setUserRole(null);
        setMembershipLoading(false);
        return;
      }

      try {
        const [memberStatus, role] = await Promise.all([
          isGroupMember(group.id),
          getUserRole(group.id)
        ]);
        setIsMember(memberStatus);
        setUserRole(role);
      } catch (error) {
        console.error('Error checking membership:', error);
        setIsMember(false);
        setUserRole(null);
      } finally {
        setMembershipLoading(false);
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
      console.error('Error handling join/leave:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Arts & Culture': 'bg-purple-100 text-purple-800',
      'Technology': 'bg-blue-100 text-blue-800',
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Sports': 'bg-green-100 text-green-800',
      'Music': 'bg-pink-100 text-pink-800',
      'Business': 'bg-gray-100 text-gray-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Health & Wellness': 'bg-emerald-100 text-emerald-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', icon: Settings },
      moderator: { color: 'bg-yellow-100 text-yellow-800', icon: Star },
      member: { color: 'bg-green-100 text-green-800', icon: Users }
    };
    return roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
  };

  if (variant === 'compact') {
    return (
      <Card className={cn("hover:shadow-md transition-all duration-200 cursor-pointer", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{group.name}</h3>
                <p className="text-xs text-muted-foreground">{group.member_count} members</p>
              </div>
            </div>
            {showActions && !membershipLoading && (
              <Button
                size="sm"
                variant={isMember ? "outline" : "default"}
                onClick={handleJoinLeave}
                disabled={loading}
                className={cn(
                  "min-w-[60px]",
                  isMember ? "border-green-200 text-green-700 hover:bg-green-50" : ""
                )}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isMember ? (
                  "Joined"
                ) : (
                  "Join"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 cursor-pointer",
      variant === 'featured' && "border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              variant === 'featured' 
                ? "bg-gradient-to-br from-orange-500 to-red-600" 
                : "bg-gradient-to-br from-blue-500 to-purple-600"
            )}>
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {group.name}
                {variant === 'featured' && (
                  <Star className="w-4 h-4 text-orange-500 ml-2 inline" />
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {group.description || 'No description available'}
              </CardDescription>
            </div>
          </div>
          
          {variant === 'featured' && (
            <Badge className="bg-orange-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category and Location */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getCategoryColor(group.category)}>
            {group.category}
          </Badge>
          {group.location_city && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{group.location_city}</span>
              {group.location_state && <span>, {group.location_state}</span>}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-blue-600">
              <Users className="w-4 h-4" />
              {group.member_count}
            </div>
            <div className="text-xs text-muted-foreground">Members</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-green-600">
              <MessageSquare className="w-4 h-4" />
              {group.post_count}
            </div>
            <div className="text-xs text-muted-foreground">Posts</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-purple-600">
              <Calendar className="w-4 h-4" />
              {new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <div className="text-xs text-muted-foreground">Created</div>
          </div>
        </div>

        {/* User Role Badge */}
        {userRole && (
          <div className="flex items-center gap-2">
            <Badge className={getRoleBadge(userRole).color}>
              <getRoleBadge(userRole).icon className="w-3 h-3 mr-1" />
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {!membershipLoading ? (
              <>
                <Button
                  className={cn(
                    "flex-1",
                    isMember 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-green-600 hover:bg-green-700"
                  )}
                  onClick={handleJoinLeave}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isMember ? (
                    <>
                      <Minus className="w-4 h-4 mr-2" />
                      Leave Group
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Join Group
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Eye className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="flex gap-2 w-full">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
