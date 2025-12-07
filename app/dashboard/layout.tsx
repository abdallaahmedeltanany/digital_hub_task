import Sidebar from "@/components/sideBar/sideBar";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex max-h-screen">
      <Sidebar />
      {children}
    </div>
  );
};

export default DashboardLayout;
