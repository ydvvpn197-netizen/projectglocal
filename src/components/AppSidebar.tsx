import { useState, useEffect } from "react";
import { Home, Users, Calendar, User, Search, Plus, Settings, MapPin, Zap, Palette, MessageSquare, Newspaper, Scale, Heart, Shield, Building2, Store, Globe, Vote, Crown, Megaphone } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { NotificationBell } from "@/components/NotificationBell";
import { NotificationButton } from "@/components/NotificationButton";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebarExports";

const mainItems = [
  { title: "Feed", url: "/feed", icon: Home, priority: "high" },
  { title: "Events", url: "/events", icon: Calendar, priority: "high" },
  { title: "Community", url: "/community", icon: Users, priority: "high" },
  { title: "News", url: "/news", icon: Newspaper, priority: "medium" },
  { title: "Discover", url: "/discover", icon: Search, priority: "medium" },
];

const secondaryItems = [
  { title: "Public Square", url: "/public-square", icon: Globe, priority: "low" },
  { title: "Local Communities", url: "/communities", icon: Building2, priority: "low" },
  { title: "Local Businesses", url: "/businesses", icon: Store, priority: "low" },
  { title: "Polls", url: "/polls", icon: Vote, priority: "low" },
  { title: "Civic Engagement", url: "/civic-engagement", icon: Megaphone, priority: "low" },
  { title: "Book Artists", url: "/book-artist", icon: Palette, priority: "low" },
];

const newFeaturesItems = [
  { title: "Legal Assistant", url: "/legal-assistant", icon: Scale },
  { title: "Life Wishes", url: "/life-wish", icon: Heart },
];



const artistItems = [
  { title: "Artist Dashboard", url: "/artist-dashboard", icon: Zap },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Privacy", url: "/privacy", icon: Shield },
  { title: "Subscription", url: "/subscription", icon: Crown },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "About", url: "/about", icon: MapPin },
];

const regularUserItems = [
  { title: "My Dashboard", url: "/dashboard", icon: User },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Privacy", url: "/privacy", icon: Shield },
  { title: "Subscription", url: "/subscription", icon: Crown },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "About", url: "/about", icon: MapPin },
];

const adminItems = [
  { title: "Admin Dashboard", url: "/admin", icon: Shield },
];


export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const { adminUser } = useAdminAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [isArtist, setIsArtist] = useState(false);

  const isActive = (path: string) => currentPath === path;
  
  // Check if user is an artist
  useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('artists')
            .select('id')
            .eq('user_id', user.id)
            .single();
          setIsArtist(!!data);
        } catch (error) {
          setIsArtist(false);
        }
      }
    };
    checkUserType();
  }, [user]);

  // Create dynamic user items based on artist status and admin status
  const getUserItems = () => {
    const baseItems = isArtist ? artistItems : regularUserItems;
    
    // If user is an admin, add admin dashboard to their navigation
    if (adminUser) {
      return [...baseItems, ...adminItems];
    }
    
    // Admin login is now completely separate from regular user sessions
    // Regular users should not see admin login option in sidebar
    // Admin login is accessible via direct URL: /admin/login
    
    return baseItems;
  };

  const userItems = getUserItems();
  
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* App Title */}
        {!collapsed && (
          <div className="p-1 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-sidebar-foreground flex items-center gap-2">
                <img 
                  src="/logo.png" 
                  alt="Glocal Logo" 
                  className="h-5 w-5 object-contain"
                />
                Glocal
              </h2>
              {user ? <NotificationBell /> : <NotificationButton />}
            </div>
          </div>
        )}

        {/* Create Button */}
        <div className="p-1">
          <SidebarMenuButton asChild>
            <NavLink to="/create" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              {!collapsed && <span>Create Post</span>}
            </NavLink>
          </SidebarMenuButton>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation - Collapsible */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Explore</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryItems.slice(0, 3).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavClass}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* New Features Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>New Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {newFeaturesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>



        {/* User Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
