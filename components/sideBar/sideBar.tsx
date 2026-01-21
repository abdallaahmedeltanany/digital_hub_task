"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, LogOut, ChevronsRight, ChevronsLeft } from "lucide-react";
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
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-white/5",
        "bg-linear-to-b from-gray-900 via-gray-900 to-gray-950",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4  border-b border-gray-800">
        {!collapsed && (
          <h1 className="text-lg font-semibold tracking-wide bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Digital Hub
          </h1>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "ml-auto rounded-sm transition-colors",
            "hover:bg-white/10 focus-visible: focus-visible:ring-blue-500",
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-5 w-5 text-amber-50" />
          ) : (
            <ChevronsLeft className="h-5 w-5  text-amber-50" />
          )}
        </Button>
      </div>

      <nav className="flex-1 px-2 py-3">
        <TooltipProvider>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "group relative mb-1 w-full gap-3 rounded-lg px-3 py-2",
                      "justify-start text-gray-300 transition-all",
                      "hover:bg-white/10 hover:text-white",
                      isActive && "bg-white/10 text-blue-400 shadow-sm",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    {isActive && !collapsed && (
                      <span className="absolute left-0 h-6 w-1 rounded-r bg-blue-500" />
                    )}

                    <Icon className="h-5 w-5 shrink-0" />

                    {!collapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Button>
                </TooltipTrigger>

                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="border-t border-white/5 p-2">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={cn(
                  "w-full gap-3 rounded-lg px-3 py-2",
                  "justify-start text-gray-400",
                  "hover:bg-red-500/10 hover:text-red-400",
                  "transition-colors",
                  collapsed && "justify-center px-0",
                )}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">Logout</span>
                )}
              </Button>
            </TooltipTrigger>

            {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
};

export default Sidebar;
