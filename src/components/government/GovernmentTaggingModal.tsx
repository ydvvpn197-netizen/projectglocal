import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { anonymousUserService, GovernmentAuthority, GovernmentTag } from '@/services/anonymousUserService';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Lightbulb,
  Flag,
  Send
} from 'lucide-react';

interface GovernmentTaggingModalProps {
  postId?: string;
  anonymousPostId?: string;
  onTagCreated?: (tag: GovernmentTag) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function GovernmentTaggingModal({
  postId,
  anonymousPostId,
  onTagCreated,
  trigger,
  className = ''
}: GovernmentTaggingModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [authorities, setAuthorities] = useState<GovernmentAuthority[]>([]);
  const [filteredAuthorities, setFilteredAuthorities] = useState<GovernmentAuthority[]>([]);
  const [selectedAuthority, setSelectedAuthority] = useState<GovernmentAuthority | null>(null);
  const [tagType, setTagType] = useState<GovernmentTag['tag_type']>('issue');
  const [priority, setPriority] = useState<GovernmentTag['priority']>('medium');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tagTypeOptions = [
    { value: 'issue', label: 'Issue', icon: AlertTriangle, description: 'Report a problem or concern' },
    { value: 'complaint', label: 'Complaint', icon: Flag, description: 'File a formal complaint' },
    { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, description: 'Suggest an improvement' },
    { value: 'request', label: 'Request', icon: MessageSquare, description: 'Request information or service' },
    { value: 'feedback', label: 'Feedback', icon: CheckCircle, description: 'Provide feedback or review' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadAuthorities();
    }
  }, [isOpen, loadAuthorities]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = authorities.filter(authority =>
        authority.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        authority.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        authority.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAuthorities(filtered);
    } else {
      setFilteredAuthorities(authorities);
    }
  }, [searchQuery, authorities]);

  const loadAuthorities = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await anonymousUserService.getGovernmentAuthorities();
      setAuthorities(data);
      setFilteredAuthorities(data);
    } catch (error) {
      console.error('Error loading government authorities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load government authorities.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAuthority) {
      toast({
        title: 'Authority Required',
        description: 'Please select a government authority.',
        variant: 'destructive'
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please provide a description for your tag.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tag = await anonymousUserService.tagGovernmentAuthority(
        selectedAuthority.id,
        {
          postId,
          anonymousPostId,
          tagType,
          priority
        }
      );

      toast({
        title: 'Tag Created',
        description: `Your ${tagType} has been tagged to ${selectedAuthority.name}.`,
      });

      onTagCreated?.(tag);
      setIsOpen(false);
      setSelectedAuthority(null);
      setDescription('');
    } catch (error) {
      console.error('Error creating government tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to create government tag. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAuthority, description, tagType, priority, toast, onTagCreated, anonymousPostId, postId]);

  const selectedTagType = tagTypeOptions.find(option => option.value === tagType);
  const selectedPriority = priorityOptions.find(option => option.value === priority);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            <Building2 className="h-4 w-4 mr-2" />
            Tag Government
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Tag Government Authority
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tag Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tag-type">Tag Type</Label>
              <Select value={tagType} onValueChange={(value: GovernmentTag['tag_type']) => setTagType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tag type" />
                </SelectTrigger>
                <SelectContent>
                  {tagTypeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: GovernmentTag['priority']) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge className={option.color}>
                        {option.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Describe your ${tagType} in detail. Be specific about the issue, location, and any relevant details.`}
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Authority Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Government Authorities</Label>
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, jurisdiction, or type..."
              className="w-full"
            />
          </div>

          {/* Authorities List */}
          <div className="space-y-2">
            <Label>Select Authority</Label>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading government authorities...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {filteredAuthorities.map((authority) => (
                  <Card
                    key={authority.id}
                    className={`cursor-pointer transition-colors ${
                      selectedAuthority?.id === authority.id
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAuthority(authority)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {authority.name}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {authority.type}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{authority.jurisdiction}</span>
                          <Badge variant="secondary" className="text-xs">
                            {authority.level}
                          </Badge>
                        </div>
                        {authority.contact_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{authority.contact_email}</span>
                          </div>
                        )}
                        {authority.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span className="truncate">{authority.website}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Response time: {authority.response_time_hours} hours</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Selected Authority Summary */}
          {selectedAuthority && (
            <Card className="bg-blue-50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Selected Authority
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 text-sm">
                  <div className="font-medium">{selectedAuthority.name}</div>
                  <div className="text-muted-foreground">
                    {selectedAuthority.type} • {selectedAuthority.jurisdiction}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={selectedPriority?.color}>
                      {selectedPriority?.label} Priority
                    </Badge>
                    <Badge variant="outline">
                      {selectedTagType?.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedAuthority || !description.trim() || isSubmitting}
            >
              {isSubmitting ? (
                'Creating Tag...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Government Tag
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
