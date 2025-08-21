# Google News API Integration Setup Guide

## Overview
This guide explains how to set up real-time Google News API integration for the location-based personalization feature.

## API Service Used
We're using **GNews API** (https://gnews.io/) which provides access to Google News data with location-based filtering.

## Setup Steps

### 1. Get GNews API Key
1. Visit https://gnews.io/
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes:
   - 100 requests/day
   - Basic search and headlines
   - Location-based filtering

### 2. Environment Variables

#### For Development (.env.local)
```bash
VITE_GNEWS_API_KEY=your_gnews_api_key_here
```

#### For Production (Supabase Edge Functions)
```bash
# Set in Supabase Dashboard > Settings > Environment Variables
GNEWS_API_KEY=your_gnews_api_key_here
```

### 3. Deploy Updated Edge Function

```bash
# Deploy the updated fetch-local-news function
supabase functions deploy fetch-local-news
```

### 4. Test the Integration

#### Test API Connection
```javascript
// Test in browser console
const response = await fetch('https://gnews.io/api/v4/top-headlines?country=us&max=1&apikey=your_api_key');
const data = await response.json();
console.log(data);
```

#### Test Edge Function
```javascript
// Test the deployed function
const { data, error } = await supabase.functions.invoke('fetch-local-news', {
  body: { 
    location: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    radius: 50
  }
});
console.log(data);
```

## Features Implemented

### ✅ Real-Time News Fetching
- Fetches live news from GNews API
- Location-based filtering using coordinates
- Fallback to mock data if API fails

### ✅ Location-Based Filtering
- Uses user's GPS coordinates for precise location
- Reverse geocoding to get city names
- Filters articles by location relevance

### ✅ Content Categorization
- Automatically categorizes articles (Events, Business, Development, etc.)
- Provides default images for each category
- Relevance scoring based on content

### ✅ Error Handling
- Graceful fallback to mock data
- API rate limiting protection
- Comprehensive error logging

## API Endpoints Used

### 1. Top Headlines (Country-based)
```
GET https://gnews.io/api/v4/top-headlines?country=us&max=20&apikey=YOUR_KEY
```

### 2. Search (Location-based)
```
GET https://gnews.io/api/v4/search?q=city_name&max=20&sortby=publishedAt&apikey=YOUR_KEY
```

### 3. Reverse Geocoding
```
GET https://nominatim.openstreetmap.org/reverse?format=json&lat=40.7128&lon=-74.0060&zoom=10
```

## Rate Limiting

### GNews API Limits
- **Free Tier**: 100 requests/day
- **Paid Tier**: 1000+ requests/day
- **Rate**: ~4 requests/minute

### Implementation
- Caching implemented to reduce API calls
- Fallback to mock data when rate limited
- Error handling for quota exceeded

## Monitoring & Debugging

### Check API Usage
```javascript
// Monitor API calls in browser console
console.log('GNews API Response:', data);
console.log('Articles fetched:', data.articles?.length);
```

### Supabase Logs
```bash
# View Edge Function logs
supabase functions logs fetch-local-news
```

### Environment Variable Check
```javascript
// Verify API key is loaded
console.log('API Key loaded:', !!process.env.VITE_GNEWS_API_KEY);
```

## Troubleshooting

### Common Issues

#### 1. API Key Not Working
```bash
# Check if key is set correctly
echo $VITE_GNEWS_API_KEY
```

#### 2. CORS Errors
- Edge Function already handles CORS
- Check if function is deployed correctly

#### 3. Rate Limiting
- Implement caching to reduce API calls
- Consider upgrading to paid tier

#### 4. Location Not Working
- Verify coordinates are being passed correctly
- Check reverse geocoding service

### Debug Commands
```bash
# Test API directly
curl "https://gnews.io/api/v4/top-headlines?country=us&max=1&apikey=YOUR_KEY"

# Test Edge Function locally
supabase functions serve fetch-local-news
```

## Performance Optimization

### 1. Caching Strategy
- Cache news results for 15 minutes
- Store in browser localStorage
- Reduce API calls for same location

### 2. Request Optimization
- Limit to 10 articles per request
- Use specific location queries
- Implement request deduplication

### 3. Fallback Strategy
- Mock data when API fails
- Progressive enhancement
- Graceful degradation

## Security Considerations

### 1. API Key Protection
- Never expose API key in client-side code
- Use environment variables
- Rotate keys regularly

### 2. Request Validation
- Validate coordinates before API calls
- Sanitize location strings
- Rate limit client requests

### 3. Data Sanitization
- Filter malicious content
- Validate article URLs
- Sanitize HTML content

## Future Enhancements

### 1. Multiple News Sources
- Integrate additional APIs (NewsAPI, Guardian)
- Aggregate from multiple sources
- Implement source ranking

### 2. Advanced Filtering
- User preference-based filtering
- Category-specific feeds
- Time-based filtering

### 3. Real-Time Updates
- WebSocket connections for live updates
- Push notifications for breaking news
- Live news ticker

## Support

For issues with:
- **GNews API**: Contact support@gnews.io
- **Edge Function**: Check Supabase documentation
- **Location Services**: Verify coordinates and geocoding

## Cost Estimation

### GNews API Pricing
- **Free**: $0/month (100 requests/day)
- **Basic**: $49/month (1000 requests/day)
- **Standard**: $99/month (10,000 requests/day)

### Recommended for Production
- Start with Basic plan ($49/month)
- Monitor usage and scale accordingly
- Implement caching to reduce costs
