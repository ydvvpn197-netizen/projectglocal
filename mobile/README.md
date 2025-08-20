# The Glocal Mobile App

A React Native mobile application for connecting local communities, discovering events, and sharing local content.

## Features

### Core Features
- **Authentication**: Secure login/register with email and password
- **Location Services**: GPS-based location detection and local content filtering
- **Feed System**: Personalized news and content feed based on location
- **Community Groups**: Join and participate in local interest groups
- **Events**: Discover and attend local events
- **Push Notifications**: Real-time notifications for events and updates
- **Offline Support**: Basic offline capabilities with data caching

### Technical Features
- **Cross-Platform**: iOS and Android support
- **TypeScript**: Full TypeScript implementation
- **State Management**: Redux Toolkit for global state
- **Navigation**: React Navigation with stack and tab navigation
- **UI Framework**: Native Base for consistent design
- **API Integration**: RESTful API integration with authentication
- **Location Services**: Native GPS and geolocation
- **Image Handling**: Camera integration and image processing
- **Social Sharing**: Native sharing capabilities

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components (Header, Loading, etc.)
│   │   ├── feed/           # Feed-related components
│   │   ├── community/      # Community components
│   │   ├── events/         # Event components
│   │   ├── location/       # Location components
│   │   ├── media/          # Media handling components
│   │   ├── sharing/        # Social sharing components
│   │   └── notifications/  # Notification components
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   └── ...             # Main app screens
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API and external services
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Redux store and slices
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript type definitions
├── android/                # Android-specific configuration
├── ios/                    # iOS-specific configuration
├── package.json            # Dependencies and scripts
├── metro.config.js         # Metro bundler configuration
├── babel.config.js         # Babel configuration
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- JDK 11 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **iOS Setup (macOS only)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Run the app**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   ```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
API_BASE_URL=https://your-api-url.com/api
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### API Configuration
Update the API base URL in `src/services/authService.ts` and other service files to point to your backend API.

## Development

### Available Scripts
- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator/device
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add proper TypeScript types
- Follow React Native performance best practices

### State Management
The app uses Redux Toolkit for state management with the following slices:
- `authSlice` - Authentication state
- `locationSlice` - Location services state
- `feedSlice` - News feed state
- `communitySlice` - Community groups state
- `eventsSlice` - Events state
- `notificationsSlice` - Push notifications state
- `offlineSlice` - Offline capabilities state

## Features Implementation

### Authentication Flow
1. User registration/login
2. Token-based authentication
3. Secure storage of credentials
4. Automatic token refresh
5. Logout functionality

### Location Services
1. GPS permission handling
2. Current location detection
3. Reverse geocoding
4. Location-based content filtering
5. Background location updates

### Feed System
1. Location-based news aggregation
2. Content categorization
3. Like and comment functionality
4. Social sharing
5. Infinite scroll pagination

### Community Features
1. Group creation and management
2. Member management
3. Group discussions
4. Event organization
5. Community moderation

### Events System
1. Event creation and management
2. Event discovery
3. RSVP functionality
4. Event reminders
5. Location-based event filtering

### Push Notifications
1. Device token registration
2. Notification categories
3. Custom notification sounds
4. Notification preferences
5. Background notification handling

### Offline Capabilities
1. Data caching
2. Offline action queuing
3. Background sync
4. Conflict resolution
5. Network status detection

## Platform-Specific Considerations

### iOS
- App Store guidelines compliance
- iOS-specific UI/UX patterns
- Background app refresh
- iOS notification permissions
- iOS-specific permissions handling

### Android
- Material Design guidelines
- Android-specific permissions
- Background services
- Android notification channels
- Android-specific optimizations

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run e2e
```

### Manual Testing Checklist
- [ ] Authentication flow
- [ ] Location permissions
- [ ] Feed functionality
- [ ] Community features
- [ ] Event management
- [ ] Push notifications
- [ ] Offline functionality
- [ ] Social sharing
- [ ] Image upload
- [ ] Navigation flow

## Deployment

### Android
1. Generate signed APK/AAB
2. Upload to Google Play Console
3. Configure release settings
4. Submit for review

### iOS
1. Archive the app in Xcode
2. Upload to App Store Connect
3. Configure app metadata
4. Submit for review

## Performance Optimization

### Bundle Size
- Code splitting
- Tree shaking
- Image optimization
- Asset compression

### Runtime Performance
- Lazy loading
- Virtualized lists
- Memory management
- Network optimization
- Battery optimization

## Security

### Data Protection
- Secure token storage
- API authentication
- Data encryption
- Privacy compliance

### Permissions
- Minimal permission requests
- Permission explanation
- Graceful permission handling

## Troubleshooting

### Common Issues
1. **Metro bundler issues**: Clear cache with `npm start -- --reset-cache`
2. **iOS build issues**: Clean build folder in Xcode
3. **Android build issues**: Clean project with `cd android && ./gradlew clean`
4. **Permission issues**: Check device settings and app permissions

### Debug Mode
Enable debug mode for development:
```javascript
// In App.tsx
if (__DEV__) {
  console.log('Debug mode enabled');
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

### Phase 1: Foundation ✅
- [x] Project setup
- [x] Basic navigation
- [x] Authentication
- [x] Core UI components

### Phase 2: Core Features 🚧
- [ ] Feed implementation
- [ ] Location services
- [ ] Community features
- [ ] Event management

### Phase 3: Advanced Features 📋
- [ ] Push notifications
- [ ] Offline capabilities
- [ ] Social sharing
- [ ] Media handling

### Phase 4: Optimization 📋
- [ ] Performance optimization
- [ ] Testing implementation
- [ ] App store preparation
- [ ] Deployment automation
