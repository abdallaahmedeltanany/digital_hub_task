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
import Link from "next/link";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const Dashboard = () => {
  const [pageNo, setPageNo] = React.useState<number>(1);
  const pageSize = 10;
  const totalPageNo = 4;
  const dispatch = useDispatch();

  const { filteredProjects, searchQuery, statusFilter } = useSelector(
    (state: RootState) => state.projects
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const apiCall = async () => {
    const res = await api.get(
      `/projects?_page=${pageNo}&_per_page=${pageSize}`
    );
    return res?.data;
  };

  const { data, isLoading, refetch } = useQuery<Project[], any>({
    queryFn: apiCall,
    queryKey: ["Projects", `${pageNo}`],
  });

  useEffect(() => {
    if (data) {
      dispatch(setProjects(data));
    }
  }, [data, dispatch]);

  const handleSearchChange = (query: string) => {
    dispatch(setSearch(query));
  };

  const handleStatusChange = (status: string) => {
    dispatch(setStatusFilter(status));
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Project Name",
      cell: ({ row }) => {
        return (
          <Link
            href={`/dashboard/projects/${row.original.id}`}
            className="text-blue-500"
          >
            {row.original.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const getStatusColor = (status: string) => {
          const statusLower = status.toLowerCase();
          switch (statusLower) {
            case "active":
            case "in progress":
              return "bg-blue-100 text-blue-800";
            case "completed":
              return "bg-green-100 text-green-800";
            case "pending":
              return "bg-yellow-100 text-yellow-800";
            case "not started":
              return "bg-gray-100 text-gray-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        const date = row.getValue("startDate") as string;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => {
        const date = row.getValue("endDate") as string;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const progress = row.getValue("progress") as number;
        return (
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-600">{progress}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }) => {
        const budget = row.getValue("budget") as number;
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(budget);
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (user?.role !== "User")
          return <ControlledProjectsDialog oldData={row.original} />;
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Spinner className="size-12" color="blue" />
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-gray-50 p-6 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage and track all your projects</p>
      </div>
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
  );
};

export default Dashboard;
