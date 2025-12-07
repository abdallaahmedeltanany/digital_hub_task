/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, CheckCircle2, User, Flag } from "lucide-react";
import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ITask } from "@/types";
import { ControlledAddTaskDialog } from "@/components/dialogs/ControlledAddTaskDialog";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const ProjectDetailsCard = () => {
  const params = useParams();
  const { user } = useSelector((state: RootState) => state.auth);

  console.log(user?.role);

  const callAPi = async () => {
    const res = await api.get(`/projects/${params.id}`);
    return res.data;
  };

  const { data: project } = useQuery({
    queryFn: callAPi,
    queryKey: ["project", params.id],
    enabled: !!params.id,
  });

  const callTasksAPi = async () => {
    const res = await api.get(`/tasks/`);
    return res.data;
  };

  const { data } = useQuery({
    queryFn: callTasksAPi,
    queryKey: ["tasks", params.id],
    enabled: !!params.id,
  });
  const tasks = data?.filter(
    (item: ITask) => item.projectId === Number(params.id)
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "not started":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 max-h-screen overflow-y-scroll">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-900">
              {project?.name}
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Project ID: #{project?.id}
            </CardDescription>
          </div>

          <Badge
            className={`px-4 py-2 text-sm font-semibold ${getStatusColor(
              project?.status
            )}`}
          >
            {project?.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Progress</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {project?.progress}%
            </span>
          </div>
          <Progress value={project?.progress} className="h-3" />

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {project?.progress === 100
                ? "Project Completed!"
                : `${100 - project?.progress}% remaining`}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-row justify-between w-full">
            <h3 className="text-xl font-semibold text-gray-800">Tasks</h3>
            {user?.role !== "User" && (
              <ControlledAddTaskDialog projectId={Number(params.id)} />
            )}
          </div>

          {tasks?.length === 0 && (
            <p className="text-gray-500 text-sm">
              No tasks found for this project.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks?.map((task: any) => (
              <Card
                key={task.id}
                className="p-4 border shadow-sm hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {task.title}
                    </h4>

                    <Badge
                      className={`text-xs border ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge
                      className={`text-xs border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      <Flag className="h-3 w-3 mr-1" />
                      {task.priority}
                    </Badge>

                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <User className="h-4 w-4" />
                      Assigned to: {task.assignedTo}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDetailsCard;
