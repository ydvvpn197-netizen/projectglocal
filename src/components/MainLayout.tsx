import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebarExports";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { User, Plus, Search, MapPin, Sparkles, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { UniformHeader } from "@/components/UniformHeader";
import { PromotionalBanner } from "@/components/marketing/PromotionalBanner";
import { NetworkStatus, NetworkStatusIndicator } from "@/components/NetworkStatus";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/NotificationBell";
import { NotificationButton } from "@/components/NotificationButton";


interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Network Status Alert */}
          <NetworkStatus />
          
          {/* Promotional Banner */}
          <PromotionalBanner 
            position="top" 
            variant="default" 
            maxCampaigns={1}
            className="z-40"
          />
          
          {/* Enhanced Header */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              <div className="flex items-center gap-4 lg:gap-6">
                <SidebarTrigger />
                <Link to="/" className="flex items-center gap-2 font-bold text-lg lg:text-xl text-gradient">
                  <img 
                    src="/logo.png" 
                    alt="Glocal Logo" 
                    className="h-6 w-6 lg:h-7 lg:w-7 object-contain"
                  />
                  <span className="hidden sm:inline">Glocal</span>
                  <span className="sm:hidden">G</span>
                </Link>
              </div>
              
              {/* Enhanced Search Bar */}
              <div className="flex-1 max-w-2xl mx-4 lg:mx-8 hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events, communities, discussions..."
                    className="pl-10 bg-muted/50 border-0 focus:bg-background transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 lg:gap-3">
                <NetworkStatusIndicator className="mr-2 hidden lg:block" user={user} />
                
                {user ? (
                  <>
                    {/* Location Indicator */}
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground hidden lg:flex">
                      <MapPin className="h-4 w-4" />
                      <span className="hidden sm:inline">Local</span>
                    </Button>
                    
                    {/* Create Button */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" className="btn-community">
                          <Plus className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Create</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuItem onClick={() => navigate('/create')} className="gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          Create Post
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/create-event')} className="gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          Create Event
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/community/create-discussion')} className="gap-3">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          Start Discussion
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/community/create-group')} className="gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Create Group
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/legal-assistant')} className="gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          Legal Assistant
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/life-wish')} className="gap-3">
                          <div className="w-2 h-2 rounded-full bg-pink-500" />
                          Life Wish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {/* Notifications */}
                    {user ? <NotificationBell /> : <NotificationButton />}
                    

                    
                    {/* User Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs">
                              {getInitials(user.user_metadata?.full_name || user.email)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="flex items-center justify-start gap-2 p-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                              {getInitials(user.user_metadata?.full_name || user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user.user_metadata?.full_name || user.email?.split('@')[0]}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-3">
                          <User className="h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-3">
                          <Settings className="h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="gap-3 text-red-600">
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={handleSignIn} size="sm" className="hidden sm:flex">
                      Sign In
                    </Button>
                    <Button onClick={handleSignIn} size="sm" className="btn-community">
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Sign In</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-muted/20">
            <div className="container mx-auto px-4 py-4 lg:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
