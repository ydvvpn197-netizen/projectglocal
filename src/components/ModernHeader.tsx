import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  User, 
  Plus, 
  Menu,
  ChevronDown,
  Settings,
  LogOut,
  Bookmark,
  Heart
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/NotificationBell";
import { NotificationButton } from "@/components/NotificationButton";

interface ModernHeaderProps {
  showSearch?: boolean;
  showCreateButton?: boolean;
  className?: string;
}

export function ModernHeader({ 
  showSearch = true, 
  showCreateButton = true,
  className = "" 
}: ModernHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={`border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Glocal Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                TheGlocal
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/discover" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/discover') 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Discover
              </Link>
              <Link 
                to="/community" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/community') 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Community
              </Link>
              <Link 
                to="/events" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/events') 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Events
              </Link>
              <Link 
                to="/book-artist" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/book-artist') 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Book Artists
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search projects, artists, or events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Create Button */}
                {showCreateButton && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="gradient" className="shadow-sm hover:shadow-md">
                        <Plus className="h-4 w-4 mr-2" />
                        Create
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('/create')}>
                        Create Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/create-event')}>
                        Create Event
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/community/create-discussion')}>
                        Start Discussion
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/community/create-group')}>
                        Create Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Notifications */}
                {user ? <NotificationBell /> : <NotificationButton />}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden sm:block text-sm font-medium">
                        {user.email?.split('@')[0]}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/my-dashboard')}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/bookmarks')}>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Bookmarks
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/likes')}>
                      <Heart className="h-4 w-4 mr-2" />
                      Liked Projects
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button size="sm" variant="gradient" className="shadow-sm hover:shadow-md" asChild>
                  <Link to="/signin">Sign Up</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search projects, artists, or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
