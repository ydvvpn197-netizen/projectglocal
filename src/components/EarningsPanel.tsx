import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, TrendingUp, Calendar, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EarningRecord {
  id: string;
  booking_id: string;
  amount: number;
  status: string;
  completed_at: string;
  client_name: string;
  event_location: string;
}

interface EarningsStats {
  totalEarnings: number;
  thisMonthEarnings: number;
  completedBookings: number;
  averageBookingValue: number;
}

export const EarningsPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    completedBookings: 0,
    averageBookingValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEarningsData();
    }
  }, [user]);

  const fetchEarningsData = async () => {
    if (!user) return;

    try {
      // First, get the artist record for the current user
      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (artistError) {
        console.error('Artist not found:', artistError);
        return;
      }

      // Fetch completed bookings with earnings data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('artist_bookings')
        .select('*')
        .eq('artist_id', artistData.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Mock some earnings data for demonstration
      const mockEarnings: EarningRecord[] = [];
      let totalEarnings = 0;
      let thisMonthEarnings = 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Generate some mock completed bookings
      for (let i = 0; i < 5; i++) {
        const amount = Math.floor(Math.random() * 500) + 100;
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        totalEarnings += amount;
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          thisMonthEarnings += amount;
        }

        mockEarnings.push({
          id: `earning_${i}`,
          booking_id: `booking_${i}`,
          amount,
          status: 'paid',
          completed_at: date.toISOString(),
          client_name: `Client ${i + 1}`,
          event_location: `Event Location ${i + 1}`
        });
      }

      setEarnings(mockEarnings);
      setStats({
        totalEarnings,
        thisMonthEarnings,
        completedBookings: mockEarnings.length,
        averageBookingValue: totalEarnings > 0 ? totalEarnings / mockEarnings.length : 0
      });

    } catch (error) {
      console.error('Error fetching earnings data:', error);
      toast({
        title: "Error",
        description: "Failed to load earnings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.completedBookings} completed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.thisMonthEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedBookings}</div>
            <p className="text-xs text-muted-foreground">
              Successful projects delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Booking</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(stats.averageBookingValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per completed project
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Recent Earnings
          </CardTitle>
          <CardDescription>
            Your latest completed bookings and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No earnings yet</p>
              <p className="text-sm">Complete bookings to start earning and tracking your income</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {earnings.map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{earning.client_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {earning.event_location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {format(new Date(earning.completed_at), 'PPP')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        +${earning.amount}
                      </div>
                      <Badge 
                        variant={earning.status === 'paid' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {earning.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
