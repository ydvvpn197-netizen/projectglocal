import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from '@/services/notificationService';
import { CheckCircle, XCircle, Clock, Calendar, User, AlertCircle } from 'lucide-react';

interface BookingTestResult {
  test: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  data?: any;
}

export const BookingSystemTest: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<BookingTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [artistInfo, setArtistInfo] = useState<any>(null);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);

  const tests: BookingTestResult[] = [
    { test: 'User Authentication', status: 'pending' },
    { test: 'Artist Profile Check', status: 'pending' },
    { test: 'Database Connection', status: 'pending' },
    { test: 'RLS Policy Test', status: 'pending' },
    { test: 'Booking Request Creation', status: 'pending' },
    { test: 'Notification Creation', status: 'pending' },
    { test: 'Real-time Subscription', status: 'pending' },
  ];

  const updateTestResult = (testName: string, status: BookingTestResult['status'], message?: string, data?: any) => {
    setTestResults(prev => prev.map(test => 
      test.test === testName 
        ? { ...test, status, message, data }
        : test
    ));
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    updateTestResult(testName, 'running');
    
    try {
      const result = await testFn();
      updateTestResult(testName, 'passed', `Success: ${JSON.stringify(result)}`, result);
      return result;
    } catch (error) {
      updateTestResult(testName, 'failed', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const runAllTests = async () => {
    if (!user?.id) {
      alert('Please log in to run tests');
      return;
    }

    setIsRunning(true);
    setTestResults(tests);

    try {
      // Test 1: User Authentication
      await runTest('User Authentication', async () => {
        if (!user?.id) throw new Error('User not authenticated');
        return { userId: user.id, email: user.email };
      });

      // Test 2: Artist Profile Check
      const artistInfo = await runTest('Artist Profile Check', async () => {
        const { data, error } = await supabase
          .from('artists')
          .select('id, user_id')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('No artist profile found for current user');
        return data;
      });
      setArtistInfo(artistInfo);

      // Test 3: Database Connection
      await runTest('Database Connection', async () => {
        const { data, error } = await supabase
          .from('artist_bookings')
          .select('count')
          .limit(1);
        
        if (error) throw error;
        return { connected: true };
      });

      // Test 4: RLS Policy Test
      await runTest('RLS Policy Test', async () => {
        const { data, error } = await supabase
          .from('artist_bookings')
          .select('*')
          .eq('artist_id', artistInfo.id)
          .limit(5);
        
        if (error) throw error;
        return { accessibleBookings: data?.length || 0 };
      });

      // Test 5: Booking Request Creation
      const testBooking = await runTest('Booking Request Creation', async () => {
        const { data, error } = await supabase
          .from('artist_bookings')
          .insert({
            user_id: user.id,
            artist_id: artistInfo.id,
            event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            event_location: 'Test Location',
            event_description: 'Test booking request for system verification',
            budget_min: 100,
            budget_max: 200,
            contact_info: 'Test contact info',
            status: 'pending'
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });

      // Test 6: Notification Creation
      await runTest('Notification Creation', async () => {
        const notificationId = await notificationService.createBookingRequestNotification(
          user.id, // artist user ID
          user.id, // client user ID (same for test)
          {
            id: testBooking.id,
            event_type: 'Test Event',
            event_date: testBooking.event_date,
            event_location: testBooking.event_location,
            budget_min: testBooking.budget_min,
            budget_max: testBooking.budget_max
          }
        );
        
        if (!notificationId) throw new Error('Failed to create notification');
        return { notificationId };
      });

      // Test 7: Real-time Subscription
      await runTest('Real-time Subscription', async () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Real-time subscription timeout'));
          }, 10000);

          const subscription = supabase
            .channel('booking_test')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'artist_bookings',
                filter: `artist_id=eq.${artistInfo.id}`
              },
              (payload) => {
                clearTimeout(timeout);
                subscription.unsubscribe();
                resolve({ realtimeWorking: true, payload });
              }
            )
            .subscribe();

          // Create another test booking to trigger the subscription
          setTimeout(async () => {
            try {
              await supabase
                .from('artist_bookings')
                .insert({
                  user_id: user.id,
                  artist_id: artistInfo.id,
                  event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                  event_location: 'Real-time Test Location',
                  event_description: 'Real-time test booking',
                  budget_min: 150,
                  budget_max: 250,
                  contact_info: 'Real-time test contact',
                  status: 'pending'
                });
            } catch (error) {
              clearTimeout(timeout);
              subscription.unsubscribe();
              reject(error);
            }
          }, 1000);
        });
      });

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const fetchBookingRequests = async () => {
    if (!artistInfo) return;

    try {
      const { data, error } = await supabase
        .from('artist_bookings')
        .select(`
          *,
          profiles!artist_bookings_user_id_fkey(display_name, avatar_url)
        `)
        .eq('artist_id', artistInfo.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookingRequests(data || []);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
    }
  };

  useEffect(() => {
    if (artistInfo) {
      fetchBookingRequests();
    }
  }, [artistInfo]);

  const getStatusIcon = (status: BookingTestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: BookingTestResult['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking System Test</CardTitle>
          <CardDescription>Please log in to run booking system tests</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking System Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing of the artist booking system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <Button 
              onClick={fetchBookingRequests} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Refresh Bookings
            </Button>
          </div>

          {artistInfo && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Artist Information</h4>
              <p className="text-sm text-muted-foreground">
                Artist ID: {artistInfo.id}
              </p>
              <p className="text-sm text-muted-foreground">
                User ID: {artistInfo.user_id}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.test}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Booking Requests
            {bookingRequests.length > 0 && (
              <Badge variant="secondary">{bookingRequests.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending booking requests</p>
              <p className="text-sm">Booking requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookingRequests.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {booking.profiles?.display_name || 'Unknown User'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{booking.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(booking.event_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Budget:</span>
                      <span>${booking.budget_min} - ${booking.budget_max}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">Event Description:</p>
                    <p className="text-muted-foreground">{booking.event_description}</p>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">Location:</p>
                    <p className="text-muted-foreground">{booking.event_location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
