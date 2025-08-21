import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, MapPin } from 'lucide-react';
import { CreatePostRequest } from '@/types/community';
import { useCommunityGroups } from '@/hooks/useCommunityGroups';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { useLocation } from '@/hooks/useLocation';

interface CreatePostDialogProps {
  groupId?: string;
  trigger?: React.ReactNode;
  onSuccess?: (postId: string) => void;
}

export const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  groupId,
  trigger,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePostRequest>({
    group_id: groupId || '',
    title: '',
    content: '',
    post_type: 'discussion',
    is_anonymous: false
  });

  const { userGroups } = useCommunityGroups();
  const { createPost } = useCommunityPosts();
  const { currentLocation } = useLocation();

  useEffect(() => {
    if (groupId) {
      setFormData(prev => ({ ...prev, group_id: groupId }));
    }
  }, [groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    if (!formData.group_id && !formData.is_anonymous) {
      return;
    }

    setLoading(true);
    try {
      const postData: CreatePostRequest = {
        ...formData,
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        location_city: (currentLocation as any)?.city || '',
        location_state: (currentLocation as any)?.state || '',
        location_country: (currentLocation as any)?.country || ''
      };

      const newPost = await createPost(postData);
      
      if (newPost) {
        setOpen(false);
        setFormData({
          group_id: groupId || '',
          title: '',
          content: '',
          post_type: 'discussion',
          is_anonymous: false
        });
        
        if (onSuccess) {
          onSuccess(newPost.id);
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePostRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const postTypes = [
    { value: 'discussion', label: 'Discussion' },
    { value: 'question', label: 'Question' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'event', label: 'Event' },
    { value: 'poll', label: 'Poll' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, ask questions, or start a discussion in your community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter post title..."
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your post content..."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="post-type">Post Type</Label>
              <Select
                value={formData.post_type}
                onValueChange={(value) => handleInputChange('post_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">Group</Label>
              <Select
                value={formData.group_id}
                onValueChange={(value) => handleInputChange('group_id', value)}
                disabled={formData.is_anonymous}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      r/{group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.is_anonymous}
              onCheckedChange={(checked) => handleInputChange('is_anonymous', checked)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Post anonymously
            </Label>
          </div>

          {currentLocation && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>
                Location: {(currentLocation as any)?.name || 'Unknown'}
              </span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
