# The Glocal - Local Community Platform

A modern web application for connecting local communities, discovering events, and supporting local artists.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd projectglocal

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- **Development**: http://localhost:8080
- **Production Preview**: http://localhost:4173 (after `npm run preview`)

## 🛠️ Development

### Available Scripts
```bash
# Development
npm run dev              # Start development server
npm run dev:analyze      # Start dev server with bundle analysis

# Building
npm run build            # Build for production
npm run build:dev        # Build for development
npm run build:prod       # Build for production (optimized)
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Database
npm run db:push          # Push database changes
npm run db:reset         # Reset database
npm run db:migrate       # Run migrations
```

## 🎨 Styling & CSS

This project uses **Tailwind CSS** with a comprehensive design system:

### CSS Architecture
- **Tailwind CSS**: Utility-first CSS framework
- **CSS Custom Properties**: Design tokens and theming
- **PostCSS**: CSS processing and optimization
- **CSS Fallbacks**: Basic styling even if Tailwind fails

### CSS Files
- `src/index.css` - Main stylesheet with Tailwind imports
- `tailwind.config.ts` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

## 🔧 Troubleshooting

### CSS Not Loading?
If you see plain HTML without styling:

1. **Check the URL**: Use `http://localhost:8080` (not file:// URLs)
2. **Clear Browser Cache**: Hard refresh with Ctrl+F5
3. **Check Console**: Open DevTools (F12) for errors
4. **Verify Dependencies**: Run `npm install` again
5. **Rebuild**: Run `npm run build && npm run preview`

### Common Issues
- **Plain HTML**: Wrong URL or CSS not loading
- **Build Errors**: Check TypeScript and dependency issues
- **Styling Issues**: Verify Tailwind configuration
- **Performance**: Use production build for testing

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

## 📱 Features

### Core Functionality
- **User Authentication**: Sign up, sign in, password reset
- **Location Services**: GPS detection, location-based content
- **Event Management**: Create, discover, and manage local events
- **Community Features**: Groups, discussions, and social interactions
- **Artist Booking**: Find and book local talent
- **Real-time Chat**: Community messaging and notifications

### Technical Features
- **Responsive Design**: Mobile-first approach
- **Progressive Web App**: Offline support and app-like experience
- **Real-time Updates**: Live notifications and chat
- **Search & Discovery**: Advanced filtering and recommendations
- **Payment Integration**: Stripe payment processing
- **Admin Panel**: Content moderation and user management

## 🏗️ Architecture

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions

### Backend
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Reliable database
- **Real-time**: WebSocket connections
- **Edge Functions**: Serverless backend logic
- **Storage**: File uploads and media management

### State Management
- **React Query**: Server state management
- **Context API**: Local state and theme management
- **Local Storage**: User preferences and caching

## 🌐 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **GitHub Pages**: `npm run deploy:github`
- **Vercel**: `npm run deploy:vercel`
- **Netlify**: `npm run deploy:netlify`
- **Custom Domain**: Configure in deployment scripts

## 📚 Documentation

- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)
- [Design System](./docs/design-system.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help:
1. Check the [troubleshooting guide](./TROUBLESHOOTING.md)
2. Search existing issues
3. Create a new issue with detailed information
4. Include browser console errors and steps to reproduce

---

**Built with ❤️ for local communities**
