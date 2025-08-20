import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Bell, User, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UniformHeader } from "@/components/UniformHeader";
import { PromotionalBanner } from "@/components/marketing/PromotionalBanner";
import { NetworkStatus, NetworkStatusIndicator } from "@/components/NetworkStatus";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
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
          
          {/* Header */}
          <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Link to="/" className="font-semibold text-foreground hover:text-primary transition-colors">
                  Local Social Hub
                </Link>
              </div>
              
              <div className="flex items-center gap-2">
                <NetworkStatusIndicator className="mr-2" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {user?.email?.split('@')[0]}
                  </span>
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}