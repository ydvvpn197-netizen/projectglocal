# Event Creation and Display Test Guide

## Overview
This guide will help you test the functionality where newly created events appear in the "Upcoming Events" section on the homepage.

## Test Steps

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Navigate to the Homepage
- Open your browser and go to `http://localhost:5173`
- Sign in with your account
- You should see the homepage with the "Upcoming Events" section

### 3. Create a New Event
- Click on "Create Event" button (either from the Quick Actions section or the Events page)
- Fill out the event form with the following details:
  - **Title**: "Test Community Event"
  - **Description**: "This is a test event to verify the functionality works correctly."
  - **Event Date**: Choose a future date (e.g., tomorrow or next week)
  - **Event Time**: "2:00 PM - 4:00 PM"
  - **Location**: "Community Center"
  - **Category**: "Community"
  - **Max Attendees**: "50"
  - **Price**: "0" (for free event)
  - **Image URL**: Leave empty (will use default image)
  - **Tags**: "test, community, local"

### 4. Submit the Event
- Click "Create Event" button
- You should see a success message
- You'll be redirected to the Events page

### 5. Verify Event Appears on Homepage
- Navigate back to the homepage (`http://localhost:5173`)
- Scroll down to the "Upcoming Events" section
- You should see your newly created event displayed in the same format as the example events in the image
- The event should show:
  - Event image (or default placeholder)
  - Event title
  - Description (truncated if too long)
  - Date, time, and location with icons
  - Category tag
  - Attendee count (0 / 50)
  - Organizer information
  - Price/status button (showing "Free")

### 6. Test Event Attendance
- Click the "Free" button on your event
- You should see the attendee count update to "1 / 50"
- The button should change to indicate you're attending

### 7. Test Event Display on Events Page
- Navigate to `/events`
- Your event should appear in the events list
- Test both grid and list view modes
- Test search functionality by searching for "Test Community Event"

## Expected Behavior

### Homepage Events Section
- Events should be displayed in a grid layout (3 columns on large screens)
- Each event card should match the design shown in the attached image
- Events should be sorted by date (earliest first)
- Only future events should be shown
- Maximum of 5 events should be displayed
- Loading states should show skeleton cards while fetching data

### Event Card Design
- **Image**: Event image at the top with action buttons (like, share)
- **Title**: Event title in large, bold text
- **Description**: Truncated description with ellipsis if too long
- **Details**: Date, time, location with appropriate icons
- **Category**: Purple pill-shaped tag
- **Attendees**: "X / Y attending" format
- **Organizer**: Avatar and name
- **Price Button**: Orange button with ticket icon and price text

### Real-time Updates
- When you create a new event, it should immediately appear in the upcoming events section
- When you attend/unattend an event, the attendee count should update in real-time
- The events list should refresh automatically when changes occur

## Troubleshooting

### If Events Don't Appear
1. Check the browser console for any JavaScript errors
2. Verify that the Supabase connection is working
3. Check if the database function `get_events_with_attendance` exists
4. Ensure the user is authenticated

### If Event Cards Don't Match Design
1. Check that the EventCard component is properly imported
2. Verify that all CSS classes are applied correctly
3. Check that the line-clamp utilities are working

### If Real-time Updates Don't Work
1. Check that the Supabase real-time subscription is active
2. Verify that the `fetchEvents` function is called after event creation
3. Check the network tab for any failed API calls

## Database Requirements

The following database function should exist:
```sql
CREATE OR REPLACE FUNCTION public.get_events_with_attendance()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  title text,
  description text,
  event_date date,
  event_time time,
  location_name text,
  location_city text,
  location_state text,
  location_country text,
  latitude numeric,
  longitude numeric,
  category text,
  max_attendees integer,
  price numeric,
  image_url text,
  tags text[],
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  attendees_count integer,
  user_attending boolean,
  organizer_name text,
  organizer_avatar text
)
```

## Success Criteria
- ✅ Newly created events appear in the upcoming events section
- ✅ Event cards match the design shown in the attached image
- ✅ Events are properly sorted by date
- ✅ Attendee functionality works correctly
- ✅ Real-time updates work when events are created or attended
- ✅ Loading states display correctly
- ✅ Empty states show appropriate messages
- ✅ Search and filtering work on the events page
