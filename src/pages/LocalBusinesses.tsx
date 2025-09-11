import React, { useState, useEffect } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useToast } from '@/hooks/use-toast';
import { LocalBusinessService, LocalBusiness, BusinessReview } from '@/services/localBusinessService';
import { 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Building2,
  Heart,
  MessageSquare,
  Calendar,
  BarChart3,
  Eye,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LocalBusinesses = () => {
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [activeTab, setActiveTab] = useState('nearby');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    price_range: '$' as '$' | '$$' | '$$$' | '$$$$'
  });

  const cities = [
    { value: 'all', label: 'All Cities' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Chennai', label: 'Chennai' },
    { value: 'Kolkata', label: 'Kolkata' },
    { value: 'Hyderabad', label: 'Hyderabad' },
    { value: 'Pune', label: 'Pune' }
  ];

  const priceRanges = [
    { value: '$', label: '$ - Budget' },
    { value: '$$', label: '$$ - Moderate' },
    { value: '$$$', label: '$$$ - Expensive' },
    { value: '$$$$', label: '$$$$ - Very Expensive' }
  ];

  useEffect(() => {
    loadBusinesses();
    loadCategories();
  }, [activeTab, selectedCategory, selectedCity]);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      let result;

      if (activeTab === 'nearby' && currentLocation) {
        result = await LocalBusinessService.getNearbyBusinesses(
          currentLocation.latitude,
          currentLocation.longitude,
          10,
          20
        );
      } else {
        result = await LocalBusinessService.getBusinesses({
          city: selectedCity !== 'all' ? selectedCity : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          limit: 20
        });
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setBusinesses(result.businesses);
    } catch (error) {
      console.error('Error loading businesses:', error);
      toast({
        title: "Error",
        description: "Failed to load businesses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await LocalBusinessService.getBusinessCategories();
      if (!result.error) {
        setCategories(result.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadBusinesses();
      return;
    }

    try {
      setLoading(true);
      const result = await LocalBusinessService.searchBusinesses(searchQuery.trim(), {
        city: selectedCity !== 'all' ? selectedCity : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        limit: 20
      });
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setBusinesses(result.businesses);
    } catch (error) {
      console.error('Error searching businesses:', error);
      toast({
        title: "Error",
        description: "Failed to search businesses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to add businesses.",
        variant: "destructive",
      });
      return;
    }

    if (!newBusiness.name.trim() || !newBusiness.category.trim() || !newBusiness.address.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const result = await LocalBusinessService.createBusiness({
        ...newBusiness,
        owner_id: user.id,
        verified: false,
        is_active: true,
        review_count: 0
      });

      if (result.business) {
        toast({
          title: "Success",
          description: "Business added successfully!",
        });
        setIsCreateDialogOpen(false);
        setNewBusiness({
          name: '',
          description: '',
          category: '',
          subcategory: '',
          phone: '',
          email: '',
          website: '',
          address: '',
          city: '',
          state: '',
          country: 'India',
          price_range: '$'
        });
        loadBusinesses();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add business.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating business:', error);
      toast({
        title: "Error",
        description: "Failed to add business.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const BusinessCard = ({ business }: { business: LocalBusiness }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {business.name}
              {business.verified && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              {business.description || 'No description available'}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={business.is_active ? "default" : "secondary"}>
              {business.category}
            </Badge>
            {business.price_range && (
              <Badge variant="outline">
                {business.price_range}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Business Info */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{business.address}, {business.city}</span>
          </div>
          {business.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{business.phone}</span>
            </div>
          )}
          {business.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{business.email}</span>
            </div>
          )}
          {business.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Visit Website
              </a>
            </div>
          )}
        </div>

        {/* Rating and Reviews */}
        {business.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{business.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({business.review_count} reviews)
            </span>
          </div>
        )}

        {/* Owner Info */}
        {business.owner_name && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={business.owner_avatar} />
              <AvatarFallback>{business.owner_name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Owned by {business.owner_name}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {business.city}, {business.state}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button size="sm" className="btn-event">
              <MessageSquare className="h-4 w-4 mr-1" />
              Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Local Businesses</h1>
            <p className="text-muted-foreground mt-2">
              Discover and support local businesses in your area
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-event">
                <Plus className="w-4 h-4 mr-2" />
                Add Business
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Business</DialogTitle>
                <DialogDescription>
                  Help others discover your local business by adding it to our directory.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Business Name *</Label>
                    <Input
                      id="name"
                      value={newBusiness.name}
                      onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={newBusiness.category}
                      onChange={(e) => setNewBusiness({ ...newBusiness, category: e.target.value })}
                      placeholder="e.g., Restaurant, Shop, Service"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newBusiness.description}
                    onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                    placeholder="Describe your business..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                      id="subcategory"
                      value={newBusiness.subcategory}
                      onChange={(e) => setNewBusiness({ ...newBusiness, subcategory: e.target.value })}
                      placeholder="e.g., Italian, Electronics, Plumbing"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_range">Price Range</Label>
                    <Select
                      value={newBusiness.price_range}
                      onValueChange={(value: '$' | '$$' | '$$$' | '$$$$') => setNewBusiness({ ...newBusiness, price_range: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priceRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newBusiness.phone}
                      onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newBusiness.email}
                      onChange={(e) => setNewBusiness({ ...newBusiness, email: e.target.value })}
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={newBusiness.website}
                    onChange={(e) => setNewBusiness({ ...newBusiness, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={newBusiness.address}
                    onChange={(e) => setNewBusiness({ ...newBusiness, address: e.target.value })}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={newBusiness.city}
                      onChange={(e) => setNewBusiness({ ...newBusiness, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newBusiness.state}
                      onChange={(e) => setNewBusiness({ ...newBusiness, state: e.target.value })}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={newBusiness.country}
                      onChange={(e) => setNewBusiness({ ...newBusiness, country: e.target.value })}
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateBusiness}
                    disabled={creating}
                    className="flex-1"
                  >
                    {creating ? 'Adding...' : 'Add Business'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="btn-event">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Businesses Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Nearby ({businesses.length})
            </TabsTrigger>
            <TabsTrigger value="city" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              By City
            </TabsTrigger>
            <TabsTrigger value="category" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              By Category
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Nearby Businesses Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {currentLocation 
                      ? "No businesses found in your area. Be the first to add one!"
                      : "Enable location access to find nearby businesses."}
                  </p>
                  <Button className="btn-event" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="city" className="space-y-6">
            <div className="flex justify-center mb-6">
              <Button onClick={loadBusinesses} className="btn-event">
                Load Businesses
              </Button>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Businesses Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No businesses found in the selected city.
                  </p>
                  <Button className="btn-event" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="category" className="space-y-6">
            <div className="flex justify-center mb-6">
              <Button onClick={loadBusinesses} className="btn-event">
                Load Businesses
              </Button>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Businesses Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No businesses found in the selected category.
                  </p>
                  <Button className="btn-event" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Business Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{businesses.length}</div>
                <div className="text-sm text-muted-foreground">Total Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {businesses.filter(b => b.verified).length}
                </div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {businesses.reduce((sum, b) => sum + b.review_count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default LocalBusinesses;
