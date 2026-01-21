/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { DataTable } from "@/components/dataTable/DataTable";
import { ControlledProjectsDialog } from "@/components/dialogs/ControlledProjectsDialog";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { RootState } from "@/store";
import { setProjects, setSearch, setStatusFilter } from "@/store/productsSlice";
import { Project } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  BadgeDollarSign,
  CircleCheckBig,
  RefreshCcwDot,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

const Dashboard = () => {
  const [pageNo, setPageNo] = React.useState<number>(1);
  const pageSize = 10;
  const totalPageNo = 4;
  const dispatch = useDispatch();

  const { filteredProjects, searchQuery, statusFilter } = useSelector(
    (state: RootState) => state.projects,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // ------------------ Table Data API Call ------------------
  const fetchTableData = async () => {
    const res = await api.get(
      `/projects?_page=${pageNo}&_per_page=${pageSize}`,
    );
    return res?.data;
  };

  const { data, isLoading, refetch } = useQuery<Project[], any>({
    queryFn: fetchTableData,
    queryKey: ["Projects", `${pageNo}`],
  });

  useEffect(() => {
    if (data) {
      dispatch(setProjects(data));
    }
  }, [data, dispatch]);

  // ------------------ Dashboard Stats API Call ------------------
  const fetchDashboardStats = async () => {
    const res = await api.get("/projects"); // full dataset for stats
    return res?.data;
  };

  const { data: statsData, isLoading: isStatsLoading } = useQuery<
    Project[],
    any
  >({
    queryKey: ["ProjectsStats"],
    queryFn: fetchDashboardStats,
  });

  const handleSearchChange = (query: string) => {
    dispatch(setSearch(query));
  };

  const handleStatusChange = (status: string) => {
    dispatch(setStatusFilter(status));
  };

  const dashboardStats = useMemo(() => {
    if (!statsData) return null;

    const total = statsData.length;
    const active = statsData.filter(
      (p) =>
        p.status.toLowerCase() === "active" ||
        p.status.toLowerCase() === "in progress",
    ).length;
    const completed = statsData.filter(
      (p) => p.status.toLowerCase() === "completed",
    ).length;
    const avgProgress =
      total > 0
        ? Math.round(
            statsData.reduce((acc, p) => acc + (p.progress || 0), 0) / total,
          )
        : 0;
    const totalBudget = statsData.reduce((acc, p) => acc + (p.budget || 0), 0);

    return { total, active, completed, avgProgress, totalBudget };
  }, [statsData]);

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "id",
      header: () => (
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          ID
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          #{row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: () => (
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Project Name
        </span>
      ),
      cell: ({ row }) => {
        return (
          <Link
            href={`/dashboard/projects/${row.original.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-150"
          >
            {row.original.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => (
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Status
        </span>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const getStatusConfig = (status: string) => {
          const statusLower = status.toLowerCase();
          switch (statusLower) {
            case "active":
            case "in progress":
              return {
                bg: "bg-blue-50",
                text: "text-blue-700",
                border: "border-blue-200",
                dot: "bg-blue-500",
              };
            case "completed":
              return {
                bg: "bg-emerald-50",
                text: "text-emerald-700",
                border: "border-emerald-200",
                dot: "bg-emerald-500",
              };
            case "pending":
              return {
                bg: "bg-amber-50",
                text: "text-amber-700",
                border: "border-amber-200",
                dot: "bg-amber-500",
              };
            case "not started":
              return {
                bg: "bg-gray-50",
                text: "text-gray-700",
                border: "border-gray-200",
                dot: "bg-gray-400",
              };
            default:
              return {
                bg: "bg-gray-50",
                text: "text-gray-700",
                border: "border-gray-200",
                dot: "bg-gray-400",
              };
          }
        };
        const config = getStatusConfig(status);
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: () => (
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Start Date
        </span>
      ),
      cell: ({ row }) => {
        const date = row.getValue("startDate") as string;
        return (
          <span className="text-sm text-gray-700">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "endDate",
      header: () => (
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          End Date
        </span>
      ),
      cell: ({ row }) => {
        const date = row.getValue("endDate") as string;
        return (
          <span className="text-sm text-gray-700">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "progress",
      header: () => (
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Progress
        </span>
      ),
      cell: ({ row }) => {
        const progress = row.getValue("progress") as number;
        const getProgressColor = (progress: number) => {
          if (progress >= 75) return "bg-emerald-500";
          if (progress >= 50) return "bg-blue-500";
          if (progress >= 25) return "bg-amber-500";
          return "bg-red-500";
        };
        return (
          <div className="flex items-center gap-3 min-w-[140px]">
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700 min-w-[38px]">
              {progress}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "budget",
      header: () => (
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Budget
        </span>
      ),
      cell: ({ row }) => {
        const budget = row.getValue("budget") as number;
        return (
          <span className="text-sm font-semibold text-gray-900">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(budget)}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => (
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Actions
        </span>
      ),
      cell: ({ row }) => {
        if (user?.role !== "User")
          return <ControlledProjectsDialog oldData={row.original} />;
      },
    },
  ];

  // ------------------ Loading Spinner ------------------
  if (isLoading || isStatsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-linear-to-br from-gray-50 to-gray-100">
        <Spinner className="size-12" color="blue" />
        <p className="mt-4 text-sm text-gray-600 animate-pulse">
          Loading projects...
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 w-full  overflow-y-scroll">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold  text-gray-800 bg-clip-text ">
                Projects Dashboard
              </h1>
              <p className="text-gray-600">
                Manage and track all your projects in one place
              </p>
            </div>
            {user?.role !== "User" && (
              <div className="hidden sm:block">
                <ControlledProjectsDialog />
              </div>
            )}
          </div>

          {dashboardStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Total Projects */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Total Projects
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardStats.total}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <StickyNote className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Active */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Active
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardStats.active}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <RefreshCcwDot className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {dashboardStats.completed}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CircleCheckBig className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Avg Progress */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Avg Progress
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {dashboardStats.avgProgress}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Budget */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Total Budget
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(dashboardStats.totalBudget)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BadgeDollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data Table Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredProjects || []}
            currentPage={pageNo}
            setCurrentPage={setPageNo}
            totalPages={totalPageNo}
            refetch={refetch}
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            statusFilter={statusFilter}
            setStatusFilter={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
