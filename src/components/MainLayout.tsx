import { UnifiedNavigation } from "@/components/UnifiedNavigation";
import { PromotionalBanner } from "@/components/marketing/PromotionalBanner";
import { NetworkStatus } from "@/components/NetworkStatus";
import { SimpleNews } from "@/components/SimpleNews";


interface MainLayoutProps {
  children: React.ReactNode;
  showNewsFeed?: boolean;
}

export function MainLayout({ children, showNewsFeed = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Network Status Alert */}
      <NetworkStatus />
      
      {/* Promotional Banner */}
      <PromotionalBanner 
        position="top" 
        variant="default" 
        maxCampaigns={1}
        className="z-40"
      />
      
      {/* Unified Navigation */}
      <UnifiedNavigation />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/20">
        <div className="container mx-auto px-4 py-4 lg:py-6">
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
    </div>
  );
}
