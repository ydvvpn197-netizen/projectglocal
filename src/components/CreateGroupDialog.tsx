import React, { useState } from 'react';
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
import { CreateGroupRequest } from '@/types/community';
import { useCommunityGroups } from '@/hooks/useCommunityGroups';
import { useLocation } from '@/hooks/useLocation';

interface CreateGroupDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: (groupId: string) => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  trigger,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: '',
    description: '',
    category: 'general',
    is_public: true,
    allow_anonymous_posts: false,
    require_approval: false
  });

  const { createGroup } = useCommunityGroups();
  const { currentLocation } = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);
    try {
      const groupData: CreateGroupRequest = {
        ...formData,
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        location_city: currentLocation?.city,
        location_state: currentLocation?.state,
        location_country: currentLocation?.country
      };

      const newGroup = await createGroup(groupData);
      
      if (newGroup) {
        setOpen(false);
        setFormData({
          name: '',
          description: '',
          category: 'general',
          is_public: true,
          allow_anonymous_posts: false,
          require_approval: false
        });
        
        if (onSuccess) {
          onSuccess(newGroup.id);
        }
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateGroupRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'technology', label: 'Technology' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
    { value: 'news', label: 'News' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'education', label: 'Education' },
    { value: 'business', label: 'Business' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'food', label: 'Food & Cooking' },
    { value: 'travel', label: 'Travel' },
    { value: 'music', label: 'Music' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'art', label: 'Art & Design' },
    { value: 'science', label: 'Science' },
    { value: 'politics', label: 'Politics' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a New Community Group</DialogTitle>
          <DialogDescription>
            Start a new community where people can share, discuss, and connect around shared interests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="Enter group name (e.g., 'LocalTech')"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              Group names should be descriptive and unique. Avoid spaces and special characters.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this group is about..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="public"
                checked={formData.is_public}
                onCheckedChange={(checked) => handleInputChange('is_public', checked)}
              />
              <Label htmlFor="public" className="text-sm">
                Make this group public
              </Label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Public groups can be discovered and joined by anyone. Private groups require an invitation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={formData.allow_anonymous_posts}
                onCheckedChange={(checked) => handleInputChange('allow_anonymous_posts', checked)}
              />
              <Label htmlFor="anonymous" className="text-sm">
                Allow anonymous posts
              </Label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Members can post without revealing their identity.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="approval"
                checked={formData.require_approval}
                onCheckedChange={(checked) => handleInputChange('require_approval', checked)}
              />
              <Label htmlFor="approval" className="text-sm">
                Require post approval
              </Label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              All posts must be approved by moderators before they appear.
            </p>
          </div>

          {currentLocation && (
            <div className="flex items-center gap-2 text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-4 w-4" />
              <span>
                Location: {currentLocation.city}
                {currentLocation.state && `, ${currentLocation.state}`}
                {currentLocation.country && `, ${currentLocation.country}`}
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
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
