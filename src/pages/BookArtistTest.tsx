import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

const BookArtistTest = () => {
  return (
    <ResponsiveLayout showNewsFeed={false}>
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Book Artist - Test Version</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a test version of the Book Artist page to check if the dynamic import works.</p>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default BookArtistTest;
