import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";
import { useFollows } from "@/hooks/useFollows";
import { useAuth } from "@/hooks/useAuth";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const FollowButton = ({ 
  userId, 
  variant = "outline", 
  size = "default", 
  className 
}: FollowButtonProps) => {
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollows(userId);

  // Don't show follow button for own profile
  if (user?.id === userId) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFollow}
      className={className}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};