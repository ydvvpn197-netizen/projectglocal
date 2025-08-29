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
import { lifeWishService, LifeWish } from '@/services/lifeWishService';
import { toast } from 'sonner';

const LifeWishPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('my-wishes');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWish, setEditingWish] = useState<LifeWish | null>(null);
  const queryClient = useQueryClient();

  // Fetch user's life wishes
  const { data: myWishes = [], refetch: refetchMyWishes } = useQuery({
    queryKey: ['my-life-wishes'],
    queryFn: () => lifeWishService.getMyLifeWishes(),
  });

  // Fetch public life wishes
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
    mutationFn: (wishData: any) => lifeWishService.createLifeWish(wishData),
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
    mutationFn: ({ wishId, updates }: { wishId: string; updates: any }) => 
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

  const handleCreateWish = (wishData: any) => {
    createWishMutation.mutate(wishData);
  };

  const handleUpdateWish = (wishData: any) => {
    if (editingWish) {
      updateWishMutation.mutate({ wishId: editingWish.id, updates: wishData });
    }
  };

  const handleDeleteWish = (wishId: string) => {
    deleteWishMutation.mutate(wishId);
  };

  const handleShareWish = (wish: LifeWish) => {
    // This would open a share dialog
    toast.info('Share functionality coming soon');
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
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Life Wishes</h1>
            <p className="text-gray-600">Share what you want to be remembered for</p>
          </div>
        </div>

        <Alert className="bg-gradient-to-r from-pink-50 to-red-50 border-pink-200">
          <Heart className="h-4 w-4 text-pink-600" />
          <AlertDescription className="text-pink-800">
            This is a safe space to express your deepest wishes and legacy. Your privacy is our priority, 
            and you control who sees your life wishes.
          </AlertDescription>
        </Alert>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Wishes</p>
                <p className="text-2xl font-bold text-blue-800">{stats?.total || 0}</p>
              </div>
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Public</p>
                <p className="text-2xl font-bold text-green-800">{stats?.public || 0}</p>
              </div>
              <Globe className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Family</p>
                <p className="text-2xl font-bold text-purple-800">{stats?.family || 0}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Shared</p>
                <p className="text-2xl font-bold text-yellow-800">{stats?.shared || 0}</p>
              </div>
              <Share2 className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-wishes" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              My Wishes
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Community Memorial
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Shared With Me
            </TabsTrigger>
          </TabsList>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Life Wish
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Create Your Life Wish
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

        {/* My Wishes Tab */}
        <TabsContent value="my-wishes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Overview Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    My Wishes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Private</span>
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        {stats?.private || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Public</span>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        {stats?.public || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Family</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        {stats?.family || 0}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-xs text-gray-500 space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      <span>Private wishes are encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      <span>Public wishes join community memorial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>Family wishes shared with loved ones</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Wishes List */}
            <div className="lg:col-span-3">
              {myWishes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No life wishes yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Start your journey by creating your first life wish. Share what you want to be remembered for.
                    </p>
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Wish
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {myWishes.map((wish) => (
                    <LifeWishCard
                      key={wish.id}
                      wish={wish}
                      isOwner={true}
                      onEdit={setEditingWish}
                      onDelete={handleDeleteWish}
                      onShare={handleShareWish}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Community Memorial Tab */}
        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Community Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Community Memorial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>This space honors the life wishes shared by our community members.</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-xs text-gray-500 space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3" />
                      <span>Celebrating shared legacies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-3 h-3" />
                      <span>Inspiring future generations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      <span>Respectful and secure</span>
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
                      Be the first to share your life wish with the community.
                    </p>
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Share Your Wish
                    </Button>
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
                    <p>Life wishes that others have chosen to share with you.</p>
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
                    <LifeWishCard
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
  );
};

export default LifeWishPage;
