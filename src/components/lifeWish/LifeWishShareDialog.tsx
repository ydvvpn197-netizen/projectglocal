import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Share2, 
  Search, 
  User, 
  Mail, 
  Users, 
  Eye, 
  Edit, 
  Trash2,
  X,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LifeWish } from '@/services/lifeWishService';

interface User {
  id: string;
  email: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
}

interface LifeWishShareDialogProps {
  wish: LifeWish;
  onShare?: (wish: LifeWish) => void;
  children: React.ReactNode;
}

export const LifeWishShareDialog: React.FC<LifeWishShareDialogProps> = ({
  wish,
  onShare,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Record<string, any>>({
    canView: true,
    canEdit: false,
    canShare: false,
    canDelete: false
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Search for users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      // Filter out the current user and format the results
      const { data: { user } } = await supabase.auth.getUser();
      const usersWithEmails = data
        ?.filter(profile => profile.user_id !== user?.id) // Don't show current user
        .map(profile => ({
          id: profile.user_id,
          email: `${profile.username || profile.display_name}@example.com`, // Placeholder email
          display_name: profile.display_name || profile.username || 'Unknown User',
          username: profile.username,
          avatar_url: profile.avatar_url
        })) || [];

      setSearchResults(usersWithEmails);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Add user to selection
  const addUser = (user: User) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // Remove user from selection
  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  // Share the wish
  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user to share with');
      return;
    }

    setIsSharing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Share with each selected user
      for (const selectedUser of selectedUsers) {
        const { error } = await supabase
          .from('life_wish_shares')
          .insert({
            wish_id: wish.id,
            shared_by: user.id,
            shared_with: selectedUser.id,
            share_type: 'user',
            permissions: permissions
          });

        if (error) throw error;
      }

      toast.success(`Life wish shared with ${selectedUsers.length} user(s)`);
      setOpen(false);
      setSelectedUsers([]);
      onShare?.(wish);
    } catch (error) {
      console.error('Error sharing life wish:', error);
      toast.error('Failed to share life wish');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Life Wish
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wish Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{wish.title}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {wish.content}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {wish.visibility === 'public' ? 'Public' : wish.visibility === 'family' ? 'Family' : 'Private'}
              </Badge>
              {wish.is_encrypted && (
                <Badge variant="secondary" className="text-xs">
                  Encrypted
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* User Search */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-search">Search Users</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="user-search"
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => addUser(user)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.display_name || user.username || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="space-y-3">
                <Label>Selected Users ({selectedUsers.length})</Label>
                <div className="space-y-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.display_name || user.username || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUser(user.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Permissions */}
          <div className="space-y-4">
            <Label>Permissions</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can-view"
                  checked={permissions.canView}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, canView: !!checked }))
                  }
                />
                <Label htmlFor="can-view" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Can view
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can-edit"
                  checked={permissions.canEdit}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, canEdit: !!checked }))
                  }
                />
                <Label htmlFor="can-edit" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Can edit
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can-share"
                  checked={permissions.canShare}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, canShare: !!checked }))
                  }
                />
                <Label htmlFor="can-share" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Can share
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can-delete"
                  checked={permissions.canDelete}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, canDelete: !!checked }))
                  }
                />
                <Label htmlFor="can-delete" className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Can delete
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSharing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={selectedUsers.length === 0 || isSharing}
            >
              {isSharing ? 'Sharing...' : `Share with ${selectedUsers.length} user(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
