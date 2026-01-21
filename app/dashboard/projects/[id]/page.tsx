/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useCallback, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  CheckCircle2,
  User,
  Flag,
  ClipboardList,
  Calendar,
  DollarSign,
  ArrowLeft,
  AlertCircle,
  Clock,
  Target,
  Search,
  Filter,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ITask } from "@/types";
import { ControlledAddTaskDialog } from "@/components/dialogs/ControlledAddTaskDialog";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusConfig {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

interface PriorityConfig {
  bg: string;
  text: string;
  border: string;
  icon: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  active: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  "in progress": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  default: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

const PRIORITY_CONFIGS: Record<string, PriorityConfig> = {
  high: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: "text-red-600",
  },
  medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "text-amber-600",
  },
  low: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "text-emerald-600",
  },
  default: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: "text-slate-600",
  },
};

const getStatusConfig = (status: string): StatusConfig => {
  return STATUS_CONFIGS[status?.toLowerCase()] || STATUS_CONFIGS.default;
};

const getPriorityConfig = (priority: string): PriorityConfig => {
  return PRIORITY_CONFIGS[priority?.toLowerCase()] || PRIORITY_CONFIGS.default;
};
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const EmptyTasksState: React.FC = () => (
  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
      <ClipboardList className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-gray-800">No tasks yet</h3>
    <p className="mb-4 max-w-sm text-sm text-gray-600">
      Get started by adding the first task to this project. Break down your
      project into manageable tasks.
    </p>
  </div>
);

interface TaskCardProps {
  task: ITask;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <Card className="group h-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-300">
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h4 className="flex-1 text-base font-semibold leading-snug text-gray-800 line-clamp-2">
              {task.title}
            </h4>
            <Badge
              className={cn(
                "inline-flex items-center gap-1.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold border",
                statusConfig.bg,
                statusConfig.text,
                statusConfig.border,
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  statusConfig.dot,
                )}
              ></span>
              {task.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <Badge
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border",
                priorityConfig.bg,
                priorityConfig.text,
                priorityConfig.border,
              )}
            >
              <Flag className={cn("h-3 w-3", priorityConfig.icon)} />
              {task.priority}
            </Badge>

            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                <User className="h-3.5 w-3.5 text-gray-600" />
              </div>
              <span className="max-w-20 truncate">
                {task.assignedTo || "Unassigned"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  iconBg?: string;
  iconColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  sublabel,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
}) => (
  <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
        iconBg,
      )}
    >
      <div className={iconColor}>{icon}</div>
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="text-lg font-bold text-gray-800 truncate">{value}</p>
      {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
    </div>
  </div>
);

const ProjectDetailsCard: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${params.id}`);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch project:", error);
      throw error;
    }
  }, [params.id]);

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
  } = useQuery({
    queryFn: fetchProject,
    queryKey: ["project", params.id],
    enabled: !!params.id,
    staleTime: 30000,
  });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get(`/tasks/`);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      throw error;
    }
  }, []);

  const {
    data: allTasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery({
    queryFn: fetchTasks,
    queryKey: ["tasks", params.id],
    enabled: !!params.id,
    staleTime: 30000,
  });

  const projectTasks = useMemo(
    () =>
      allTasks?.filter((item: ITask) => item.projectId === Number(params.id)) ||
      [],
    [allTasks, params.id],
  );

  const filteredTasks = useMemo(() => {
    let filtered = [...projectTasks];

    if (searchQuery) {
      filtered = filtered.filter((task: ITask) =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (task: ITask) =>
          task.status?.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (task: ITask) =>
          task.priority?.toLowerCase() === priorityFilter.toLowerCase(),
      );
    }

    return filtered;
  }, [projectTasks, searchQuery, statusFilter, priorityFilter]);

  const taskStats = useMemo(() => {
    if (!projectTasks.length) return null;

    const completed = projectTasks.filter(
      (t: ITask) => t.status?.toLowerCase() === "completed",
    ).length;
    const inProgress = projectTasks.filter((t: ITask) =>
      ["active", "in progress"].includes(t.status?.toLowerCase()),
    ).length;
    const highPriority = projectTasks.filter(
      (t: ITask) => t.priority?.toLowerCase() === "high",
    ).length;

    return { total: projectTasks.length, completed, inProgress, highPriority };
  }, [projectTasks]);

  const statusConfig = useMemo(
    () => getStatusConfig(project?.status),
    [project?.status],
  );

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  if (projectLoading || tasksLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center w-full">
        <div className="text-center">
          <Spinner className="mx-auto mb-4 h-12 w-12" color="blue" />
          <p className="text-sm font-medium text-gray-700">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (projectError || tasksError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            Failed to load project
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            There was an error loading the project details.
          </p>
          <button
            onClick={handleGoBack}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOverdue =
    project?.endDate &&
    new Date(project.endDate) < new Date() &&
    project.progress < 100;

  return (
    <div className="h-full w-full max-h-screen overflow-y-auto bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          onClick={handleGoBack}
          className="group flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>

        <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white/90  backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-linear-to-r from-gray-50 to-white p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
                    {project?.name}
                  </CardTitle>
                  {isOverdue && (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      <Clock className="mr-1 h-3 w-3" />
                      Overdue
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm text-gray-600">
                  Project ID: #{project?.id}
                </CardDescription>
              </div>

              <Badge
                className={cn(
                  "inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold border shadow-sm",
                  statusConfig.bg,
                  statusConfig.text,
                  statusConfig.border,
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 animate-pulse rounded-full",
                    statusConfig.dot,
                  )}
                ></span>
                {project?.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                icon={<Calendar className="h-5 w-5" />}
                label="Start Date"
                value={formatDate(project?.startDate)}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
              />
              <StatsCard
                icon={<Target className="h-5 w-5" />}
                label="End Date"
                value={formatDate(project?.endDate)}
                sublabel={isOverdue ? "Overdue" : undefined}
                iconBg={isOverdue ? "bg-red-100" : "bg-emerald-100"}
                iconColor={isOverdue ? "text-red-600" : "text-emerald-600"}
              />
              <StatsCard
                icon={<DollarSign className="h-5 w-5" />}
                label="Budget"
                value={formatCurrency(project?.budget || 0)}
                iconBg="bg-green-100"
                iconColor="text-green-600"
              />
              <StatsCard
                icon={<ClipboardList className="h-5 w-5" />}
                label="Total Tasks"
                value={taskStats?.total || 0}
                sublabel={
                  taskStats ? `${taskStats.completed} completed` : undefined
                }
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
              />
            </div>

            <section className="space-y-4 rounded-xl border border-gray-200 bg-linear-to-br from-gray-50 to-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-800">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-semibold">
                    Project Progress
                  </span>
                </div>
                <span className="text-3xl font-bold text-gray-800">
                  {project?.progress}%
                </span>
              </div>

              <div className="space-y-2">
                <Progress
                  value={project?.progress}
                  className="h-3 rounded-full"
                  style={{
                    color: "red",
                  }}
                />
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle2
                  className={cn(
                    "h-4 w-4",
                    project?.progress === 100
                      ? "text-emerald-600"
                      : "text-gray-400",
                  )}
                />
                {project?.progress === 100 ? (
                  <span className="text-emerald-700">
                    Project completed successfully! 🎉
                  </span>
                ) : (
                  <span>
                    {100 - project?.progress}% remaining to completion
                  </span>
                )}
              </div>
            </section>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList className="h-5 w-5 text-gray-700" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Project Tasks
                  </h3>
                </div>
                {taskStats && (
                  <p className="text-sm text-gray-600">
                    {taskStats.completed} of {taskStats.total} tasks completed
                    {taskStats.highPriority > 0 &&
                      ` • ${taskStats.highPriority} high priority`}
                  </p>
                )}
              </div>

              {user?.role !== "User" && (
                <ControlledAddTaskDialog projectId={Number(params.id)} />
              )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-10 bg-white border-gray-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <Filter className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-[180px] bg-white">
                    <Flag className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchQuery ||
              statusFilter !== "all" ||
              priorityFilter !== "all") && (
              <div className="mb-4 text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {filteredTasks.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {projectTasks.length}
                </span>{" "}
                tasks
              </div>
            )}

            {filteredTasks.length === 0 ? (
              projectTasks.length === 0 ? (
                <EmptyTasksState />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    No tasks found
                  </h3>
                  <p className="mb-4 max-w-sm text-sm text-gray-600">
                    Try adjusting your search or filter criteria to find what
                    you&apos;re looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setPriorityFilter("all");
                    }}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTasks.map((task: ITask) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetailsCard;
