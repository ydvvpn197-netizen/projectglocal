import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Calendar, Clock, MapPin, User, CreditCard, Shield } from 'lucide-react';
import { usePayment } from '../hooks/usePayment';
import { PaymentForm } from './PaymentForm';
import { paymentService } from '../services/paymentService';

interface Booking {
  id: string;
  artist_id: string;
  artist_name: string;
  artist_avatar?: string;
  event_date: string;
  event_time: string;
  duration: number; // in hours
  location: string;
  event_type: string;
  description?: string;
  price: number; // in cents
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface BookingPaymentProps {
  booking: Booking;
  onPaymentSuccess?: (result: { success: boolean; transactionId?: string }) => void;
  onPaymentError?: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function BookingPayment({
  booking,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
  className = ''
}: BookingPaymentProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { error, clearError } = usePayment();

  const formatAmount = (amount: number, currency: string) => {
    return paymentService.formatAmount(amount, currency);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateTotal = () => {
    const basePrice = booking.price;
    const serviceFee = Math.round(basePrice * 0.10); // 10% service fee
    const total = basePrice + serviceFee;
    
    return {
      basePrice,
      serviceFee,
      total
    };
  };

  const handleProceedToPayment = () => {
    setShowPaymentForm(true);
    clearError();
  };

  const handlePaymentSuccess = (result: { success: boolean; transactionId?: string }) => {
    setShowPaymentForm(false);
    onPaymentSuccess?.(result);
  };

  const handlePaymentError = (error: string) => {
    setShowPaymentForm(false);
    onPaymentError?.(error);
  };

  const handleCancel = () => {
    setShowPaymentForm(false);
    onCancel?.();
  };

  const { basePrice, serviceFee, total } = calculateTotal();

  if (showPaymentForm) {
    return (
      <div className={className}>
        <PaymentForm
          amount={total}
          currency={booking.currency}
          description={`Booking for ${booking.artist_name} - ${booking.event_type}`}
          metadata={{
            booking_id: booking.id,
            artist_id: booking.artist_id,
            event_type: booking.event_type,
            event_date: booking.event_date,
            event_time: booking.event_time
          }}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Booking Payment
        </CardTitle>
        <CardDescription>
          Complete your booking payment for {booking.artist_name}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Booking Summary</h3>
          
          {/* Artist Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            {booking.artist_avatar ? (
              <img 
                src={booking.artist_avatar} 
                alt={booking.artist_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <div className="font-medium">{booking.artist_name}</div>
              <div className="text-sm text-muted-foreground">{booking.event_type}</div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(booking.event_date)}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatTime(booking.event_time)} ({booking.duration} hours)</span>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{booking.location}</span>
            </div>
          </div>

          {booking.description && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">Event Description</div>
              <div className="text-sm text-muted-foreground">{booking.description}</div>
            </div>
          )}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold">Payment Details</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Price</span>
              <span>{formatAmount(basePrice, booking.currency)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Service Fee (10%)</span>
              <span>{formatAmount(serviceFee, booking.currency)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatAmount(total, booking.currency)}</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your payment is secure and encrypted. We use industry-standard SSL encryption to protect your information.
          </AlertDescription>
        </Alert>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={loading}
          >
            Cancel Booking
          </Button>
          
          <Button
            onClick={handleProceedToPayment}
            className="flex-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay {formatAmount(total, booking.currency)}
              </>
            )}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div>• Payment will be processed securely through Stripe</div>
          <div>• You'll receive a confirmation email after payment</div>
          <div>• Cancellation policy applies to this booking</div>
        </div>
      </CardContent>
    </Card>
  );
}
