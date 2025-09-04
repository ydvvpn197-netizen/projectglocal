# TheGlocal.in - Community Platform

A modern React-based community platform connecting local communities with social media features, event management, and local services discovery.

## 🌟 Features

- **Social Media Feed**: Create posts, vote, comment, and engage with community content
- **Event Management**: Create and discover local events
- **Local Services**: Find and offer services in your area
- **Community Groups**: Join and create interest-based groups
- **Artist Profiles**: Showcase talent and connect with local artists
- **Legal Assistant**: AI-powered legal document generation
- **Real-time Chat**: Community messaging and notifications
- **Location-based Discovery**: Find content and services near you

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library
- **Deployment**: GitHub Pages + Vercel support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- Git
- A Supabase account (for backend services)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/projectglocal.git
cd projectglocal
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your Supabase credentials:

```env
# Required - Get these from your Supabase project dashboard
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional API keys (for enhanced features)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_NEWS_API_KEY=your_news_api_key

# Feature flags
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_ERROR_TRACKING=true
```

### 3. Database Setup

If using Supabase locally:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
npm run db:migrate

# Generate TypeScript types
npm run db:generate
```

### 4. Start Development

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 🏗 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev:analyze      # Start dev server with bundle analysis

# Building
npm run build            # Production build
npm run build:dev        # Development build
npm run build:prod       # Optimized production build
npm run preview          # Preview production build

# Code Quality
npm run type-check       # TypeScript type checking
npm run lint             # ESLint check
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with UI

# Database
npm run db:push          # Push schema changes
npm run db:reset         # Reset local database
npm run db:migrate       # Run migrations
npm run db:generate      # Generate TypeScript types

# Deployment
npm run deploy:simple    # Build and prepare for deployment
npm run deploy:github    # Deploy to GitHub Pages
npm run deploy:vercel    # Deploy to Vercel
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── auth/           # Authentication components
│   ├── social-media/   # Social media components
│   └── ...
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services and business logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── config/             # Configuration files
└── integrations/       # Third-party integrations
    └── supabase/       # Supabase client and types
```

### Code Style Guidelines

- Use TypeScript with strict typing (`strict: true`)
- Follow Airbnb ESLint rules with Prettier formatting
- Use camelCase for variables/functions, PascalCase for components
- Add JSDoc comments for exported functions and APIs
- Maximum 120 characters per line
- Prefer `const` over `let` unless reassignment needed

## 📦 Building

### Development Build

```bash
npm run build:dev
```

### Production Build

```bash
npm run build:prod
```

The build outputs to the `dist/` directory with:
- Optimized JavaScript and CSS bundles
- Source maps for debugging
- Asset optimization and compression
- Proper SPA routing configuration

### Build Verification

```bash
# Check build output
ls -la dist/

# Test production build locally
npm run preview
```

## 🚀 Deployment

### Automatic Deployment (Recommended)

The project includes GitHub Actions CI/CD pipeline that automatically:

1. **Quality Checks**: Type checking, linting, and testing
2. **Build**: Creates optimized production build
3. **Deploy**: Deploys to GitHub Pages on push to `main`

Just push to the main branch:

```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

### Manual Deployment

#### GitHub Pages

```bash
# Build and deploy
npm run deploy:simple
npm run deploy:github
```

#### Vercel

```bash
# Build and deploy
npm run deploy:vercel
```

#### Custom Hosting

```bash
# Build the project
npm run build:prod

# Upload the dist/ folder to your hosting provider
# Make sure to configure SPA routing (redirect all routes to index.html)
```

### Environment Variables for Production

Set these in your deployment platform:

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ERROR_TRACKING=true
VITE_APP_VERSION=1.0.0
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test

# Run with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Structure

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API and service integration tests
- **Coverage Target**: 80%+ test coverage

### Writing Tests

```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## 🔧 Configuration

### Environment Configuration

The app uses a centralized configuration system in `src/config/environment.ts`:

- **Required**: Supabase URL and API key
- **Optional**: Third-party API keys (Google Maps, Stripe, etc.)
- **Feature Flags**: Enable/disable features
- **Performance Settings**: Cache TTL, API timeouts

### Security Configuration

- Content Security Policy (CSP)
- XSS Protection
- Input sanitization
- Rate limiting
- Session management

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**: Check TypeScript errors with `npm run type-check`
2. **Supabase Connection**: Verify environment variables and network
3. **Dependencies**: Run `npm ci` to clean install
4. **Port Conflicts**: Development server uses port 8080

### Debug Mode

Enable debug mode for detailed logging:

```env
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_LOGGING=true
```

### Getting Help

- Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- Review [Security Improvements](SECURITY_IMPROVEMENTS.md)
- Check [Deployment Fixes](DEPLOYMENT_FIXES_SUMMARY.md)

## 📄 Documentation

- [API Documentation](docs/api.md)
- [Component Documentation](docs/components.md)
- [Database Schema](docs/database.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention

Use [Conventional Commits](https://conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## 📊 Performance

- **Lighthouse Score**: 90+ across all metrics
- **Bundle Size**: Optimized with code splitting
- **Load Time**: < 3s on 3G networks
- **Core Web Vitals**: All metrics in green

## 🔒 Security

- Regular security audits with `npm audit`
- Dependency vulnerability scanning
- Input sanitization and validation
- HTTPS enforced in production
- Secure authentication with Supabase Auth

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support and questions:

- 📧 Email: support@theglocal.in
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/projectglocal/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/projectglocal/discussions)

---

**Live Demo**: [https://theglocal.in](https://theglocal.in)

**Status**: ✅ Production Ready | 🚀 Actively Deployed | 🔄 CI/CD Enabled
