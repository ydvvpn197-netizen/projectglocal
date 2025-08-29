import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Heart, 
  Lock, 
  Globe, 
  Users, 
  Shield, 
  Save, 
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { LifeWish, LifeWishFormData } from '@/services/lifeWishService';
import { toast } from 'sonner';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(2000, 'Content must be less than 2000 characters'),
  visibility: z.enum(['private', 'public', 'family']),
  is_encrypted: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface LifeWishEditorProps {
  wish?: LifeWish;
  onSave?: (wish: LifeWish) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export const LifeWishEditor: React.FC<LifeWishEditorProps> = ({ 
  wish, 
  onSave, 
  onCancel,
  mode = 'create' 
}) => {
  const [isEncrypted, setIsEncrypted] = useState(wish?.is_encrypted ?? true);
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: wish?.title || '',
      content: wish?.content || '',
      visibility: wish?.visibility || 'private',
      is_encrypted: wish?.is_encrypted ?? true,
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      // This would be handled by the parent component or service
      const wishData: LifeWishFormData = {
        title: data.title,
        content: data.content,
        visibility: data.visibility,
        is_encrypted: data.is_encrypted,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newWish: LifeWish = {
        id: wish?.id || 'new-id',
        user_id: 'current-user',
        title: data.title,
        content: data.content,
        visibility: data.visibility,
        is_encrypted: data.is_encrypted,
        created_at: wish?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      onSave?.(newWish);
      toast.success(mode === 'create' ? 'Life wish created successfully' : 'Life wish updated successfully');
    } catch (error) {
      console.error('Error saving life wish:', error);
      toast.error('Failed to save life wish');
    }
  };

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

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return 'Only you can see this wish';
      case 'public':
        return 'Visible to everyone in the community memorial space';
      case 'family':
        return 'Shared with designated family members';
      default:
        return '';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return 'bg-gray-100 text-gray-700';
      case 'public':
        return 'bg-blue-100 text-blue-700';
      case 'family':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (showPreview) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Heart className="w-5 h-5" />
              Preview
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                onClick={form.handleSubmit(handleSubmit)}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {form.watch('title') || 'Your Life Wish'}
              </h2>
              <div className="flex items-center justify-center gap-2">
                {getVisibilityIcon(form.watch('visibility'))}
                <Badge className={getVisibilityColor(form.watch('visibility'))}>
                  {form.watch('visibility')}
                </Badge>
                {isEncrypted && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    <Shield className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                )}
              </div>
            </div>
            <Separator />
            <div className="prose max-w-none">
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border border-gray-200">
                <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {form.watch('content') || 'Your life wish content will appear here...'}
                </p>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500 mt-4">
              <p>This is how your life wish will appear to others</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Heart className="w-5 h-5" />
          {mode === 'create' ? 'Create Life Wish' : 'Edit Life Wish'}
        </CardTitle>
        <Alert>
          <Heart className="h-4 w-4" />
          <AlertDescription>
            Share what you want to be remembered for. This is a safe space to express your deepest wishes and legacy.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-base font-medium">
              What do you want to be remembered for?
            </Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="e.g., A person who brought joy to others"
              className="mt-2 text-lg"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content" className="text-base font-medium">
              Your Life Wish
            </Label>
            <Textarea
              id="content"
              {...form.register('content')}
              placeholder="Share your thoughts, dreams, and what you hope your legacy will be. What impact do you want to have on the world? What values do you want to pass on?"
              className="mt-2 min-h-[200px] text-base leading-relaxed"
              rows={8}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.content.message}</p>
            )}
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>
                {form.watch('content')?.length || 0} / 2000 characters
              </span>
              <div className="flex items-center gap-2">
                {isEncrypted && <Shield className="w-4 h-4" />}
                <span>{isEncrypted ? 'Encrypted' : 'Not encrypted'}</span>
              </div>
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Privacy Settings</Label>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getVisibilityIcon(form.watch('visibility'))}
                  <div>
                    <div className="font-medium">Visibility</div>
                    <div className="text-sm text-gray-500">
                      {getVisibilityDescription(form.watch('visibility'))}
                    </div>
                  </div>
                </div>
                <Select
                  value={form.watch('visibility')}
                  onValueChange={(value) => form.setValue('visibility', value as any)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Private
                      </div>
                    </SelectItem>
                    <SelectItem value="family">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Family
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Public
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Encryption</div>
                    <div className="text-sm text-gray-500">
                      Keep your wish secure with encryption
                    </div>
                  </div>
                </div>
                <Switch
                  checked={isEncrypted}
                  onCheckedChange={(checked) => {
                    setIsEncrypted(checked);
                    form.setValue('is_encrypted', checked);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Your privacy is important to us. Private wishes are encrypted and only visible to you. 
              Family wishes are shared only with designated family members. Public wishes contribute to our community memorial space.
            </AlertDescription>
          </Alert>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Heart className="w-4 h-4 mr-2" />
              {mode === 'create' ? 'Create Wish' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
