# TheGlocal - Community Platform

A comprehensive community platform built with React, TypeScript, Vite, and Supabase. TheGlocal enables users to connect locally, share news, organize events, book artists, and engage in discussions with privacy controls and anonymous participation options.

## 🌟 Features

### Core Community Features
- **News Feed**: AI-summarized local news with discussion threads
- **Event Management**: Create, organize, and attend local events
- **Artist Booking**: Book local artists and service providers
- **Community Groups**: Join and create local community groups
- **Anonymous Engagement**: Post and comment anonymously with privacy controls
- **Real-time Chat**: Direct messaging and group conversations
- **Government Polls**: Create polls and tag government authorities for local issues

### User Management
- **Dual User Types**: Regular users and artists with different pricing plans
- **Subscription System**: ₹20/month for users, ₹100/month for artists
- **Privacy Controls**: Granular privacy settings for anonymous participation
- **Location-based**: Connect with people in your local area

### Advanced Features
- **AI Legal Assistant**: Generate legal documents and contracts
- **Life Wishes**: Secure, encrypted personal goal tracking
- **Voice Control**: Voice-activated navigation and commands
- **Real-time Notifications**: Push notifications and email alerts
- **Admin Dashboard**: Comprehensive admin panel with user management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Supabase account and project
- (Optional) Stripe account for payments
- (Optional) Google Maps API key for location services

### 1. Clone and Install
```bash
git clone <repository-url>
cd projectglocal
npm install
```

### 2. Environment Setup
```bash
# Run the interactive setup script
node scripts/setup-environment.js

# Or manually copy and configure
cp env.example .env
# Edit .env with your credentials
```

### 3. Required Environment Variables
```env
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe (Optional - for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Google Maps (Optional - for location services)
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...

# News API (Optional - for news feed)
VITE_NEWS_API_KEY=your-news-api-key
```

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:8080` to see your application.

## 🛠️ Development

### Available Scripts
```bash
# Development
npm run dev              # Start development server
npm run dev:analyze      # Start with bundle analysis

# Building
npm run build            # Production build
npm run build:dev        # Development build
npm run build:prod       # Optimized production build
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier

# Analysis
npm run analyze:bundle   # Analyze bundle size
npm run analyze:deps     # Check for unused dependencies
npm run performance      # Run Lighthouse performance audit
```

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── admin/          # Admin panel components
│   └── ...
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── config/             # Configuration files
├── contexts/           # React contexts
└── routes/             # Routing configuration
```

## 🗄️ Database Schema

The application uses Supabase (PostgreSQL) with the following key tables:

### Core Tables
- `profiles` - User profiles with location and artist information
- `posts` - Community posts and content
- `events` - Local events and gatherings
- `artists` - Artist profiles and services
- `chat_conversations` - Real-time messaging
- `notifications` - User notifications

### Feature Tables
- `news_cache` - Cached news articles with AI summaries
- `legal_chat_sessions` - AI legal assistant conversations
- `life_wishes` - Encrypted personal goals
- `government_polls` - Community polls with authority tagging
- `subscription_plans` - Pricing plans and subscriptions

### Security
- Row Level Security (RLS) enabled on all tables
- Comprehensive audit logging
- Admin role-based access control
- Privacy settings for anonymous participation

## 🚀 Deployment

### GitHub Pages (Recommended)
The project is configured for automatic deployment to GitHub Pages:

1. **Enable GitHub Pages** in repository settings
2. **Set up secrets** in repository settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY` (optional)
3. **Push to main branch** - automatic deployment triggers

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the database migrations from `supabase/migrations/`
3. Configure Row Level Security policies
4. Set up authentication providers
5. Configure storage buckets for file uploads

### Stripe Integration
1. Create a Stripe account
2. Get your publishable key
3. Set up webhooks for subscription events
4. Configure products and pricing plans

### Google Maps
1. Enable Maps JavaScript API
2. Create API key with domain restrictions
3. Configure for location services

## 🧪 Testing

### Running Tests
```bash
# All tests
npm run test

# Specific test suites
npm run test:ui          # Interactive test runner
npm run test:coverage    # Coverage report
npm run test:watch       # Watch mode
```

### Test Structure
- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API and database integration tests
- **E2E Tests**: End-to-end user flow tests (Playwright)

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Component lazy loading with Suspense
- **Bundle Analysis**: Built-in bundle size analysis
- **Caching**: Intelligent caching strategies
- **Image Optimization**: Optimized image loading

### Performance Monitoring
```bash
npm run performance      # Lighthouse audit
npm run analyze:bundle   # Bundle analysis
```

## 🔒 Security

### Security Features
- **Row Level Security**: Database-level access control
- **Input Sanitization**: XSS protection
- **CSRF Protection**: Cross-site request forgery protection
- **Content Security Policy**: Strict CSP headers
- **Audit Logging**: Comprehensive security audit trails

### Privacy Controls
- **Anonymous Participation**: Post and comment anonymously
- **Privacy Settings**: Granular privacy controls
- **Data Encryption**: Sensitive data encryption
- **GDPR Compliance**: Data protection compliance

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions

### Configuration Status
Visit `/config-status` in your running application to check:
- Environment variable configuration
- Supabase connection status
- Feature availability
- System health

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Video calling integration
- [ ] Advanced AI features
- [ ] Blockchain integration for payments

### Community
- Join our community discussions
- Contribute to open source development
- Report bugs and suggest features
- Help with documentation

---

**Built with ❤️ for local communities worldwide**