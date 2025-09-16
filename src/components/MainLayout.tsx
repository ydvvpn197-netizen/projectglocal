import { AppSidebar } from "@/components/AppSidebar";
import { PromotionalBanner } from "@/components/marketing/PromotionalBanner";
import { NetworkStatus } from "@/components/NetworkStatus";
import { SimpleNews } from "@/components/SimpleNews";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebarExports";

interface MainLayoutProps {
  children: React.ReactNode;
  showNewsFeed?: boolean;
}

export function MainLayout({ children, showNewsFeed = true }: MainLayoutProps) {
  return (
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
        
        {/* App Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          <main className="flex-1 overflow-auto bg-muted/20">
            <div className="w-full px-2 py-4 lg:py-6">
              {showNewsFeed ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Main Content Area */}
                  <div className="lg:col-span-3">
                    {children}
                  </div>
                  
                  {/* News Feed Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-4">
                      <SimpleNews className="max-h-[calc(100vh-2rem)] overflow-y-auto" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  {children}
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
