import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ArtistOnly, UserOnly, RoleGuard } from '@/components/auth/RoleGuard';
import { 
  User, 
  Palette, 
  Settings, 
  Shield, 
  MapPin, 
  Bell,
  Eye,
  EyeOff
} from 'lucide-react';

export const UserRoleDemo: React.FC = () => {
  const { role, isUser, isArtist, loading: roleLoading } = useUserRole();
  const { profile, artistProfile, settings, loading: profileLoading } = useUserProfile();

  if (roleLoading || profileLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Role Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Role & Access
          </CardTitle>
          <CardDescription>
            Your current role and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Current Role:</span>
            <Badge variant={isArtist ? "default" : "secondary"}>
              {role || 'Loading...'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">Regular User: {isUser ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="text-sm">Artist: {isArtist ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your current profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Display Name:</span>
                <p className="text-sm text-muted-foreground">{profile.display_name || 'Not set'}</p>
              </div>
              <div>
                <span className="font-medium">Bio:</span>
                <p className="text-sm text-muted-foreground">{profile.bio || 'Not set'}</p>
              </div>
              <div>
                <span className="font-medium">Location:</span>
                <p className="text-sm text-muted-foreground">
                  {[profile.location_city, profile.location_state, profile.location_country]
                    .filter(Boolean)
                    .join(', ') || 'Not set'}
                </p>
              </div>
              <div>
                <span className="font-medium">User Type:</span>
                <Badge variant="outline">{profile.user_type}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Artist-Specific Information */}
      <ArtistOnly fallback={
        <Card>
          <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
            <Palette className="h-8 w-8 mr-2" />
            Artist features are only available to artists
          </CardContent>
        </Card>
      }>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Artist Profile
            </CardTitle>
            <CardDescription>
              Your artist-specific information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {artistProfile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Experience:</span>
                  <p className="text-sm text-muted-foreground">
                    {artistProfile.experience_years} years
                  </p>
                </div>
                <div>
                  <span className="font-medium">Availability:</span>
                  <Badge variant={artistProfile.is_available ? "default" : "secondary"}>
                    {artistProfile.is_available ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Specialties:</span>
                  <p className="text-sm text-muted-foreground">
                    {artistProfile.specialty?.join(', ') || 'Not set'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Rate Range:</span>
                  <p className="text-sm text-muted-foreground">
                    ${artistProfile.hourly_rate_min || 0} - ${artistProfile.hourly_rate_max || 0}/hour
                  </p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Portfolio URLs:</span>
                  <p className="text-sm text-muted-foreground">
                    {artistProfile.portfolio_urls?.join(', ') || 'Not set'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </ArtistOnly>

      {/* User-Only Features */}
      <UserOnly fallback={
        <Card>
          <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
            <User className="h-8 w-8 mr-2" />
            Regular user features are only available to regular users
          </CardContent>
        </Card>
      }>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Features
            </CardTitle>
            <CardDescription>
              Features available to regular users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Browse Artists</div>
                  <div className="text-sm text-muted-foreground">Find and connect with local artists</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Book Services</div>
                  <div className="text-sm text-muted-foreground">Book artist services and events</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </UserOnly>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control your privacy and visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Profile Visibility</span>
                <Badge variant={settings.privacy_profile ? "secondary" : "default"}>
                  {settings.privacy_profile ? 'Private' : 'Public'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Show Location</span>
                <Badge variant={settings.show_location ? "default" : "secondary"}>
                  {settings.show_location ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Show Contact Info</span>
                <Badge variant={settings.show_contact_info ? "default" : "secondary"}>
                  {settings.show_contact_info ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Allow Messages</span>
                <Badge variant="outline">{settings.allow_messages_from || 'Not set'}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Email Notifications</span>
                <Badge variant={settings.email_notifications ? "default" : "secondary"}>
                  {settings.email_notifications ? 'On' : 'Off'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Push Notifications</span>
                <Badge variant={settings.push_notifications ? "default" : "secondary"}>
                  {settings.push_notifications ? 'On' : 'Off'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Booking Notifications</span>
                <Badge variant={settings.booking_notifications ? "default" : "secondary"}>
                  {settings.booking_notifications ? 'On' : 'Off'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Message Notifications</span>
                <Badge variant={settings.message_notifications ? "default" : "secondary"}>
                  {settings.message_notifications ? 'On' : 'Off'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role-Based Access Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role-Based Access Examples
          </CardTitle>
          <CardDescription>
            Examples of how role-based access control works
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RoleGuard allowedRoles={['user', 'artist']}>
              <Button variant="outline" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Available to All Users
              </Button>
            </RoleGuard>
            
            <RoleGuard allowedRoles={['artist']}>
              <Button variant="outline" className="w-full">
                <Palette className="h-4 w-4 mr-2" />
                Artist Only Feature
              </Button>
            </RoleGuard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
