/**
 * Life Wish Component
 * Manages user's legacy wishes and memorial content
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Plus, Edit, Trash2, Eye, EyeOff, Users, Globe, Lock, Calendar, Tag, MessageSquare } from 'lucide-react';
import { lifeWishService, LifeWish, MemorialProfile } from '@/services/lifeWishService';
import { useAuth } from '@/hooks/useAuth';

interface LifeWishProps {
  className?: string;
}

export function LifeWish({ className }: LifeWishProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-wishes');
  const [loading, setLoading] = useState(false);
  const [wishes, setWishes] = useState<LifeWish[]>([]);
  const [memorialProfile, setMemorialProfile] = useState<MemorialProfile | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userWishes, profile, wishStats] = await Promise.all([
        lifeWishService.getUserWishes(),
        lifeWishService.getMemorialProfile(),
        lifeWishService.getWishStats()
      ]);
      setWishes(userWishes);
      setMemorialProfile(profile);
      setStats(wishStats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <Heart className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access your Life Wishes.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Heart className="h-8 w-8 text-pink-600" />
          <h1 className="text-3xl font-bold">Life Wishes</h1>
        </div>
        <p className="text-muted-foreground">
          Share what you want to be remembered as and create your legacy
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <span className="text-sm font-medium">Total Wishes</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalWishes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Public</span>
              </div>
              <p className="text-2xl font-bold">{stats.publicWishes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Private</span>
              </div>
              <p className="text-2xl font-bold">{stats.privateWishes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Family</span>
              </div>
              <p className="text-2xl font-bold">{stats.familyWishes}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-wishes">My Wishes</TabsTrigger>
          <TabsTrigger value="memorial">Memorial</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="my-wishes" className="space-y-4">
          <MyWishes wishes={wishes} onRefresh={loadUserData} />
        </TabsContent>

        <TabsContent value="memorial" className="space-y-4">
          <MemorialProfile profile={memorialProfile} onUpdate={loadUserData} />
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <CommunityMemorials />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <WishTimeline wishes={wishes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// My Wishes Component
function MyWishes({ wishes, onRefresh }: { wishes: LifeWish[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingWish, setEditingWish] = useState<LifeWish | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    visibility: 'private',
    category: 'other',
    tags: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      visibility: 'private',
      category: 'other',
      tags: ''
    });
    setEditingWish(null);
    setShowForm(false);
  };

  const submitWish = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    setLoading(true);
    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      if (editingWish) {
        await lifeWishService.updateLifeWish(editingWish.id, formData);
      } else {
        await lifeWishService.createLifeWish(
          formData.title,
          formData.content,
          formData.visibility as any,
          formData.category,
          tags
        );
      }
      
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error saving wish:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWish = async (wishId: string) => {
    if (!confirm('Are you sure you want to delete this wish?')) return;
    
    try {
      await lifeWishService.deleteLifeWish(wishId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting wish:', error);
    }
  };

  const editWish = (wish: LifeWish) => {
    setFormData({
      title: wish.title,
      content: wish.content,
      visibility: wish.visibility,
      category: wish.category,
      tags: wish.tags.join(', ')
    });
    setEditingWish(wish);
    setShowForm(true);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4 text-green-500" />;
      case 'private':
        return <Lock className="h-4 w-4 text-blue-500" />;
      case 'family':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Lock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">My Life Wishes</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Wish
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingWish ? 'Edit Wish' : 'Create New Wish'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What do you want to be remembered for?"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your thoughts, values, memories, or advice..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Visibility</label>
                <Select value={formData.visibility} onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Private</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="family">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Family Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>Public</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legacy">Legacy</SelectItem>
                    <SelectItem value="values">Values</SelectItem>
                    <SelectItem value="memories">Memories</SelectItem>
                    <SelectItem value="advice">Advice</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="family, love, kindness, wisdom..."
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={submitWish} disabled={loading || !formData.title.trim() || !formData.content.trim()}>
                {loading ? 'Saving...' : editingWish ? 'Update Wish' : 'Create Wish'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {wishes.map((wish) => (
          <Card key={wish.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getVisibilityIcon(wish.visibility)}
                    <Badge variant="outline">{wish.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(wish.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-medium mb-2">{wish.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                    {wish.content}
                  </p>
                  {wish.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {wish.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => editWish(wish)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteWish(wish.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {wishes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No life wishes yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Share what you want to be remembered for
              </p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Wish
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Memorial Profile Component
function MemorialProfile({ profile, onUpdate }: { profile: MemorialProfile | null; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatar: '',
    isMemorial: false,
    memorialDate: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        isMemorial: profile.isMemorial || false,
        memorialDate: profile.memorialDate || ''
      });
    }
  }, [profile]);

  const submitProfile = async () => {
    if (!formData.displayName.trim()) return;

    setLoading(true);
    try {
      await lifeWishService.updateMemorialProfile(
        formData.displayName,
        formData.bio,
        formData.avatar,
        formData.isMemorial,
        formData.memorialDate || undefined
      );
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Memorial Profile</h3>
        <Button onClick={() => setShowForm(true)}>
          {profile ? 'Edit Profile' : 'Create Profile'}
        </Button>
      </div>

      {profile && !showForm && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {profile.avatar && (
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="text-xl font-semibold">{profile.displayName}</h4>
                <p className="text-muted-foreground mt-1">{profile.bio}</p>
                {profile.isMemorial && profile.memorialDate && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Calendar className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">
                      In Loving Memory • {new Date(profile.memorialDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Memorial Profile</CardTitle>
            <CardDescription>
              Set up how you want to be remembered in the community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="How should you be remembered?"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell your story..."
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Avatar URL (Optional)</label>
              <Input
                value={formData.avatar}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isMemorial"
                  checked={formData.isMemorial}
                  onChange={(e) => setFormData(prev => ({ ...prev, isMemorial: e.target.checked }))}
                />
                <label htmlFor="isMemorial" className="text-sm font-medium">
                  This is a memorial profile
                </label>
              </div>
              {formData.isMemorial && (
                <div>
                  <label className="text-sm font-medium">Memorial Date</label>
                  <Input
                    type="date"
                    value={formData.memorialDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, memorialDate: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button onClick={submitProfile} disabled={loading || !formData.displayName.trim()}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Community Memorials Component
function CommunityMemorials() {
  const [memorials, setMemorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMemorials();
  }, []);

  const loadMemorials = async () => {
    try {
      setLoading(true);
      const data = await lifeWishService.getPublicMemorials();
      setMemorials(data);
    } catch (error) {
      console.error('Error loading memorials:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Community Memorials</h3>
      
      <div className="grid gap-4">
        {memorials.map((memorial) => (
          <Card key={memorial.id}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {memorial.avatar_url && (
                  <img
                    src={memorial.avatar_url}
                    alt={memorial.display_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{memorial.display_name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{memorial.bio}</p>
                  {memorial.memorial_date && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">
                        {new Date(memorial.memorial_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="mt-2">
                    <Badge variant="outline">
                      {memorial.wish_count} wishes
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {memorials.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No public memorials yet</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wish Timeline Component
function WishTimeline({ wishes }: { wishes: LifeWish[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Wish Timeline</h3>
      
      <div className="space-y-4">
        {wishes.map((wish) => (
          <Card key={wish.id}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{wish.title}</h4>
                    <Badge variant="outline">{wish.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(wish.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {wish.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {wishes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No wishes in your timeline yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
