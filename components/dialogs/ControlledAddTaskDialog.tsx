"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ControlledInput from "../controlledComponents/ControlledInput";
import ControlledButton from "../controlledComponents/ControlledButton";
import { api } from "@/lib/api";
import { useState } from "react";
import { ITask } from "@/types";

interface DialogProps {
  projectId: number;
  refetch?: () => void;
}

export function ControlledAddTaskDialog({ projectId }: DialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<ITask>({
    defaultValues: {
      title: "",
      status: "Not Started",
      priority: "Medium",
      projectId: projectId,
      assignedTo: 1,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ITask) => {
      const res = await api.post(`/tasks`, data);
      return res.data;
    },

    onMutate: async (newTask) => {
      await queryClient.cancelQueries({
        queryKey: ["tasks", projectId.toString()],
      });

      const previousTasks = queryClient.getQueryData<ITask[]>([
        "tasks",
        projectId.toString(),
      ]);

      const optimisticTask: ITask = {
        ...newTask,
        id: Date.now(),
      };

      queryClient.setQueryData<ITask[]>(
        ["tasks", projectId.toString()],
        (old) => [...(old || []), optimisticTask]
      );
      setOpen(false);

      return { previousTasks };
    },

    onError: (error, _, context) => {
      console.error("Task adding failed:", error);

      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["tasks", projectId.toString()],
          context.previousTasks
        );
      }
      alert("Failed to add task!");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", projectId.toString()],
      });
    },

    onSuccess: () => {
      reset();
      setOpen(false);
    },
  });

  const onSubmit = (data: ITask) => {
    const payload = { ...data, projectId };
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} /> Add Task
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for this project.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <ControlledInput
              label="Task Title"
              name="title"
              type="text"
              register={register("title", {
                required: "Title is required",
              })}
              placeholder="Enter task title"
              error={errors.title?.message}
            />

            {/* Status */}
            <div className="grid gap-1">
              <Label className="font-bold text-lg text-gray-700 px-1">
                Status
              </Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-white text-lg font-semibold text-gray-600 w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-red-500">{errors.status.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="grid gap-1">
              <Label className="font-bold text-lg text-gray-700 px-1">
                Priority
              </Label>
              <Controller
                name="priority"
                control={control}
                rules={{ required: "Priority is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-white text-lg font-semibold text-gray-600 w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="text-red-500">{errors.priority.message}</p>
              )}
            </div>

            {/* Assigned To */}
            <ControlledInput
              label="Assigned To (User ID)"
              name="assignedTo"
              type="number"
              register={register("assignedTo", {
                required: "Assigned user is required",
                valueAsNumber: true,
              })}
              placeholder="User ID"
              error={errors.assignedTo?.message}
            />
          </div>

          <DialogFooter className="flex gap-3">
            <DialogClose asChild>
              <ControlledButton
                variant="outline"
                name="Cancel"
                type="button"
                disabled={false}
              />
            </DialogClose>

            <ControlledButton
              variant="outline"
              name={mutation.isPending ? "Saving..." : "Save Task"}
              type="submit"
              disabled={!isDirty || mutation.isPending}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
