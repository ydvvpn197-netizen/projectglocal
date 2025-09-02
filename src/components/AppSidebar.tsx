import { useState, useEffect } from "react";
import { Home, Users, Calendar, User, Search, Plus, Settings, MapPin, Zap, Palette, Bell, MessageSquare, Newspaper, Scale, Heart } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { NotificationBell } from "@/components/NotificationBell";
import { NotificationButton } from "@/components/NotificationButton";
import { useAuth } from "@/hooks/useAuth";
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
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Feed", url: "/feed", icon: Home },
  { title: "Discover", url: "/discover", icon: Search },
  { title: "About", url: "/about", icon: MapPin },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Community", url: "/community", icon: Users },
  { title: "Book Artists", url: "/book-artist", icon: Palette },
];

const newFeaturesItems = [
  { title: "Legal Assistant", url: "/legal-assistant", icon: Scale },
  { title: "Life Wishes", url: "/life-wish", icon: Heart },
];



const artistItems = [
  { title: "Artist Dashboard", url: "/artist-dashboard", icon: Zap },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "News Feed", url: "/news", icon: Newspaper },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

const regularUserItems = [
  { title: "My Dashboard", url: "/user-dashboard", icon: User },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "News Feed", url: "/news", icon: Newspaper },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [isArtist, setIsArtist] = useState(false);

  const isActive = (path: string) => currentPath === path;
  const isMainGroupExpanded = mainItems.some((item) => isActive(item.url));
  const isNewFeaturesGroupExpanded = newFeaturesItems.some((item) => isActive(item.url));
  
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

  const userItems = isArtist ? artistItems : regularUserItems;
  const isUserGroupExpanded = userItems.some((item) => isActive(item.url));
  
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
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-sidebar-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Glocal
              </h2>
              {user ? <NotificationBell /> : <NotificationButton />}
            </div>
          </div>
        )}

        {/* Create Button */}
        <div className="p-2">
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
