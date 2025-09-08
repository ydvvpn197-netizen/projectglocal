import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Calendar, Clock, Star, User, DollarSign } from 'lucide-react';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import type { Service, ServiceData, ServiceBooking, UserPlanInfo } from '@/types/monetization';

interface ServiceMarketplaceProps {
  userPlanInfo?: UserPlanInfo;
}

export function ServiceMarketplace({ userPlanInfo }: ServiceMarketplaceProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserServices();
      loadUserBookings();
    }
  }, [user]);

  const loadUserServices = async () => {
    if (!user) return;
    
    try {
      const userServices = await stripeService.getUserServices(user.id);
      setServices(userServices);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserBookings = async () => {
    if (!user) return;
    
    try {
      const userBookings = await stripeService.getUserBookings(user.id, 'provider');
      setBookings(userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleCreateService = async (serviceData: ServiceData) => {
    try {
      const newService = await stripeService.createService(serviceData);
      setServices(prev => [newService, ...prev]);
      setIsCreateDialogOpen(false);
      toast.success('Service created successfully');
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    }
  };

  const handleUpdateService = async (serviceId: string, serviceData: Partial<ServiceData>) => {
    try {
      const updatedService = await stripeService.updateService(serviceId, serviceData);
      setServices(prev => prev.map(s => s.id === serviceId ? updatedService : s));
      setEditingService(null);
      toast.success('Service updated successfully');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await stripeService.deleteService(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const updatedBooking = await stripeService.updateBookingStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
      toast.success('Booking status updated');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  if (!userPlanInfo?.can_create_services) {
    return (
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            Service Marketplace
          </CardTitle>
          <CardDescription>
            Create and sell services to other users on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-4">
              You need a premium subscription to create and sell services.
            </p>
            <Button 
              onClick={() => window.location.href = '/profile'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Service Marketplace
              </CardTitle>
              <CardDescription>
                Create and manage your services, view bookings and earnings.
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Service</DialogTitle>
                  <DialogDescription>
                    Set up a new service that other users can book and purchase.
                  </DialogDescription>
                </DialogHeader>
                <ServiceForm 
                  onSubmit={handleCreateService}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">My Services ({services.length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading services...</div>
          ) : services.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-semibold mb-2">No Services Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first service to start earning on the platform.
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={setEditingService}
                  onDelete={handleDeleteService}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                <p className="text-muted-foreground">
                  When users book your services, they'll appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onUpdateStatus={handleUpdateBookingStatus}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {editingService && (
        <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update your service details and pricing.
              </DialogDescription>
            </DialogHeader>
            <ServiceForm
              service={editingService}
              onSubmit={(data) => handleUpdateService(editingService.id, data)}
              onCancel={() => setEditingService(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ServiceCard({ 
  service, 
  onEdit, 
  onDelete 
}: { 
  service: Service; 
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{service.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {service.description}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(service)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(service.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="font-semibold">
              ${(service.price / 100).toFixed(2)} {service.currency.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={service.is_active ? "default" : "secondary"}>
              {service.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          {service.category && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Category</span>
              <span className="text-sm">{service.category}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BookingCard({ 
  booking, 
  onUpdateStatus 
}: { 
  booking: ServiceBooking; 
  onUpdateStatus: (bookingId: string, status: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {booking.customer?.display_name || 'Unknown Customer'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {new Date(booking.booking_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {booking.duration_minutes} minutes
              </span>
            </div>
            {booking.customer_notes && (
              <p className="text-sm text-muted-foreground">
                Note: {booking.customer_notes}
              </p>
            )}
          </div>
          <div className="text-right space-y-2">
            <div className="font-semibold">
              ${(booking.total_amount / 100).toFixed(2)} {booking.currency.toUpperCase()}
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
            {booking.status === 'pending' && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                  className="text-red-600"
                >
                  Cancel
                </Button>
              </div>
            )}
            {booking.status === 'confirmed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(booking.id, 'completed')}
              >
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceForm({ 
  service, 
  onSubmit, 
  onCancel 
}: { 
  service?: Service; 
  onSubmit: (data: ServiceData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<ServiceData>({
    title: service?.title || '',
    description: service?.description || '',
    price: service?.price || 0,
    currency: service?.currency || 'usd',
    category: service?.category || '',
    max_bookings_per_day: service?.max_bookings_per_day || 10,
    requires_approval: service?.requires_approval || false,
    cancellation_policy: service?.cancellation_policy || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Service Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Photography Session"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="photography">Photography</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="art">Art & Design</SelectItem>
              <SelectItem value="writing">Writing</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
              <SelectItem value="tutoring">Tutoring</SelectItem>
              <SelectItem value="fitness">Fitness</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your service in detail..."
          rows={4}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price (in cents)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
            placeholder="5000 (for $50.00)"
            required
          />
          <p className="text-xs text-muted-foreground">
            Current: ${(formData.price / 100).toFixed(2)}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_bookings">Max Bookings Per Day</Label>
          <Input
            id="max_bookings"
            type="number"
            value={formData.max_bookings_per_day}
            onChange={(e) => setFormData(prev => ({ ...prev, max_bookings_per_day: parseInt(e.target.value) || 10 }))}
            min="1"
            max="50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
        <Textarea
          id="cancellation_policy"
          value={formData.cancellation_policy}
          onChange={(e) => setFormData(prev => ({ ...prev, cancellation_policy: e.target.value }))}
          placeholder="Describe your cancellation and refund policy..."
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {service ? 'Update Service' : 'Create Service'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
