"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: "Home", href: "/dashboard" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/auth");
  };

  return (
    <div
      className={cn(
        "relative h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
        {!collapsed && (
          <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Digital Hub
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto hover:bg-gray-800"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        <TooltipProvider>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 hover:bg-gray-800",
                      isActive && "bg-gray-800 text-blue-400",
                      collapsed && "justify-center"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="border-t border-gray-800 p-2">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 hover:bg-red-900/20 hover:text-red-400",
                  collapsed && "justify-center"
                )}
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">Logout</span>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>Logout</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Sidebar;
