import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Heart, 
  Plus, 
  Lock, 
  Globe, 
  Users, 
  Shield, 
  Sparkles,
  BookOpen,
  Calendar,
  Star,
  Eye,
  Share2
} from 'lucide-react';
import { LifeWishEditor } from '@/components/lifeWish/LifeWishEditor';
import { LifeWishCard, MemorialLifeWishCard, CompactLifeWishCard } from '@/components/lifeWish/LifeWishCard';
import { SharedWishCard } from '@/components/lifeWish/SharedWishCard';
import { lifeWishService, LifeWish } from '@/services/lifeWishService';
import { toast } from 'sonner';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';

const LifeWishPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('my-wishes');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWish, setEditingWish] = useState<LifeWish | null>(null);
  const queryClient = useQueryClient();

  // Fetch user's private life wishes only
  const { data: myWishes = [], refetch: refetchMyWishes } = useQuery({
    queryKey: ['my-private-life-wishes'],
    queryFn: () => lifeWishService.getMyPrivateLifeWishes(),
  });

  // Fetch all public life wishes (including user's own public wishes)
  const { data: publicWishes = [], refetch: refetchPublicWishes } = useQuery({
    queryKey: ['public-life-wishes'],
    queryFn: () => lifeWishService.getPublicLifeWishes(),
  });

  // Fetch shared life wishes
  const { data: sharedWishes = [], refetch: refetchSharedWishes } = useQuery({
    queryKey: ['shared-life-wishes'],
    queryFn: () => lifeWishService.getSharedLifeWishes(),
  });

  // Fetch life wish statistics
  const { data: stats } = useQuery({
    queryKey: ['life-wish-stats'],
    queryFn: () => lifeWishService.getLifeWishStats(),
  });

  // Create life wish mutation
  const createWishMutation = useMutation({
    mutationFn: (wishData: Record<string, unknown>) => lifeWishService.createLifeWish(wishData),
    onSuccess: () => {
      refetchMyWishes();
      setShowCreateDialog(false);
      toast.success('Life wish created successfully');
    },
    onError: (error) => {
      console.error('Error creating life wish:', error);
      toast.error('Failed to create life wish');
    },
  });

  // Update life wish mutation
  const updateWishMutation = useMutation({
    mutationFn: ({ wishId, updates }: { wishId: string; updates: Record<string, unknown> }) => 
      lifeWishService.updateLifeWish(wishId, updates),
    onSuccess: () => {
      refetchMyWishes();
      setEditingWish(null);
      toast.success('Life wish updated successfully');
    },
    onError: (error) => {
      console.error('Error updating life wish:', error);
      toast.error('Failed to update life wish');
    },
  });

  const handleUpdateWish = (wishData: Record<string, unknown>) => {
    if (editingWish) {
      updateWishMutation.mutate({ wishId: editingWish.id, updates: wishData });
    }
  };

  // Delete life wish mutation
  const deleteWishMutation = useMutation({
    mutationFn: (wishId: string) => lifeWishService.deleteLifeWish(wishId),
    onSuccess: () => {
      refetchMyWishes();
      toast.success('Life wish deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting life wish:', error);
      toast.error('Failed to delete life wish');
    },
  });

  const handleCreateWish = (wishData: Record<string, unknown>) => {
    createWishMutation.mutate(wishData);
  };

  const handleDeleteWish = (wishId: string) => {
    deleteWishMutation.mutate(wishId);
  };

  const handleShareWish = (wish: LifeWish) => {
    // Refresh the shared wishes after sharing
    refetchSharedWishes();
    toast.success('Life wish shared successfully');
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

  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Life Wishes</h1>
                <p className="text-gray-600">Preserve and share your life's most important wishes</p>
              </div>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Life Wish
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    Create New Life Wish
                  </DialogTitle>
                </DialogHeader>
                <LifeWishEditor
                  mode="create"
                  onSave={handleCreateWish}
                  onCancel={() => setShowCreateDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Alert className="bg-pink-50 border-pink-200">
            <Heart className="h-4 w-4 text-pink-600" />
            <AlertDescription className="text-pink-800">
              <strong>Life Wishes:</strong> Create, preserve, and share your most important life wishes with loved ones. 
              These can include personal messages, legacy wishes, or important decisions you want to communicate.
            </AlertDescription>
          </Alert>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Private Wishes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.private || 0}</p>
                  </div>
                  <Lock className="w-8 h-8 text-pink-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Public Wishes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.public || 0}</p>
                  </div>
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Shared With Me</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.shared || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Wishes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                  </div>
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-wishes" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              My Wishes
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Public Wishes
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Shared With Me
            </TabsTrigger>
          </TabsList>

          {/* My Wishes Tab */}
          <TabsContent value="my-wishes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* My Wishes Info */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      My Wishes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Your private life wishes that are only visible to you. These are your personal thoughts and wishes that you want to keep private.</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-xs text-gray-500 space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        <span>Private and secure</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        <span>Encrypted by default</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-3 h-3" />
                        <span>Personal wishes only</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* My Wishes List */}
              <div className="lg:col-span-3">
                {myWishes.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No private wishes yet</h3>
                      <p className="text-gray-500 mb-6">
                        Create your first private life wish to get started. These are personal messages, 
                        legacy wishes, or important decisions you want to keep private and secure.
                      </p>
                      <Button onClick={() => setShowCreateDialog(true)} className="bg-pink-600 hover:bg-pink-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Private Wish
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {myWishes.map((wish) => (
                      <LifeWishCard
                        key={wish.id}
                        wish={wish}
                        showUserInfo={false}
                        onEdit={() => setEditingWish(wish)}
                        onDelete={() => handleDeleteWish(wish.id)}
                        onShare={handleShareWish}
                        isOwner={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Public Wishes Tab */}
          <TabsContent value="public" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Public Info */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Public Wishes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>All public life wishes from the community, including your own public wishes. These are shared openly to inspire and connect with others.</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-xs text-gray-500 space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        <span>Publicly shared</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        <span>Community inspiration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-3 h-3" />
                        <span>Your public wishes included</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Public Wishes */}
              <div className="lg:col-span-3">
                {publicWishes.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No public wishes yet</h3>
                      <p className="text-gray-500 mb-6">
                        When others share their life wishes publicly, they'll appear here for community inspiration.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {publicWishes.map((wish) => (
                      <MemorialLifeWishCard
                        key={wish.id}
                        wish={wish}
                        showUserInfo={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Shared With Me Tab */}
          <TabsContent value="shared" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Shared Info */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Shared With Me
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Life wishes that others have specifically shared with you. These are private wishes that people have chosen to share with you personally.</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-xs text-gray-500 space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-3 h-3" />
                        <span>Personal connections</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        <span>Trusted sharing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span>Shared by others</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Shared Wishes */}
              <div className="lg:col-span-3">
                {sharedWishes.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No shared wishes yet</h3>
                      <p className="text-gray-500 mb-6">
                        When others share their life wishes with you, they'll appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {sharedWishes.map((wish) => (
                      <SharedWishCard
                        key={wish.id}
                        wish={wish}
                        onShare={handleShareWish}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        {editingWish && (
          <Dialog open={!!editingWish} onOpenChange={() => setEditingWish(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Edit Life Wish
                </DialogTitle>
              </DialogHeader>
              <LifeWishEditor
                wish={editingWish}
                mode="edit"
                onSave={handleUpdateWish}
                onCancel={() => setEditingWish(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default LifeWishPage;
