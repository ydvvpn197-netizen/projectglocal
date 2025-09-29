import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Music, Calendar, Star } from "lucide-react";

const BookArtistTest = () => {
  return (
    <StandardPageLayout
      title="Book Artist - Test Version"
      subtitle="Artist Booking System"
      description="Test version of the Book Artist page to verify dynamic imports and functionality."
      variant="dashboard"
      maxWidth="lg"
      badges={[
        { label: "Test", variant: "secondary", icon: <Star className="w-3 h-3" /> },
        { label: "Artist", variant: "outline", icon: <Music className="w-3 h-3" /> },
        { label: "Booking", variant: "default", icon: <Calendar className="w-3 h-3" /> }
      ]}
      actions={
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Book Artist - Test Version</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a test version of the Book Artist page to check if the dynamic import works.</p>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
};

export default BookArtistTest;
