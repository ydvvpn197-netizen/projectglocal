import { AppSidebar } from "@/components/AppSidebar";
import { PromotionalBanner } from "@/components/marketing/PromotionalBanner";
import { NetworkStatus } from "@/components/NetworkStatus";
import { SimpleNews } from "@/components/SimpleNews";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebarExports";

interface MainLayoutProps {
  children: React.ReactNode;
  showNewsFeed?: boolean;
}

export function MainLayout({ children, showNewsFeed = true }: MainLayoutProps) {
  return (
    <>
      {/* Mobile Navigation - Only show on mobile */}
      <MobileNavigation />
      
      <SidebarProvider>
        <div className="min-h-screen bg-background flex">
          {/* Network Status Alert */}
          <NetworkStatus />
          
          {/* Promotional Banner */}
          <PromotionalBanner 
            position="top" 
            variant="default" 
            maxCampaigns={1}
            className="z-40"
          />
          
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden lg:block">
            <AppSidebar />
          </div>

          {/* Main Content Area */}
          <SidebarInset className="flex-1">
            <main className="flex-1 overflow-auto bg-background">
              <div className="w-full px-4 py-4 lg:px-6 lg:py-6 pt-16 lg:pt-4">
                {showNewsFeed ? (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 min-h-0">
                      {children}
                    </div>
                    
                    {/* News Feed Sidebar - Only show on larger screens */}
                    <div className="hidden lg:block lg:col-span-1">
                      <div className="sticky top-6">
                        <SimpleNews className="max-h-[calc(100vh-3rem)] overflow-y-auto" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-7xl mx-auto">
                    {children}
                  </div>
                )}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}
