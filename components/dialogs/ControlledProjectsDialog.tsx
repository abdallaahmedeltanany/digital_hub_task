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
import { Project } from "@/types";
import { Edit } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useState } from "react";
import ControlledInput from "../controlledComponents/ControlledInput";
import ControlledButton from "../controlledComponents/ControlledButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { updateProject } from "@/store/productsSlice";

interface DialogProps {
  oldData: Project;
  refetch?: () => void;
}

export function ControlledProjectsDialog({ oldData, refetch }: DialogProps) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<Project>({
    defaultValues: {
      id: oldData?.id,
      name: oldData?.name,
      status: oldData?.status,
      startDate: oldData?.startDate,
      endDate: oldData?.endDate,
      progress: oldData?.progress,
      budget: oldData?.budget,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Project) => {
      const res = await api.put(`/projects/${oldData?.id}`, data);
      return res.data;
    },
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ["Projects"] });

      const previousProjects = queryClient.getQueryData(["Projects"]);

      dispatch(updateProject(newProject));

      setOpen(false);

      return { previousProjects };
    },
    onSuccess: (data) => {
      console.log("Project updated successfully:", data);
      dispatch(updateProject(data));
      queryClient.invalidateQueries({ queryKey: ["Projects"] });
      if (refetch) {
        refetch();
      }
    },
    onError: (error, newProject, context) => {
      console.error("Error updating project:", error);
      if (context?.previousProjects) {
        queryClient.setQueryData(["Projects"], context.previousProjects);
      }
      setOpen(true);
      alert("Failed to update project. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["Projects"] });
    },
  });

  const onSubmit = (data: Project) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <ControlledInput
              label="Project Name"
              name="name"
              type="text"
              register={register("name", {
                required: "Project name is required",
              })}
              placeholder="Enter project name"
              error={errors.name?.message}
            />

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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="not started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-red-500">{errors.status.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ControlledInput
                label="Start Date"
                name="startDate"
                type="date"
                register={register("startDate", {
                  required: "Start date is required",
                })}
                placeholder=""
                error={errors.startDate?.message}
              />
              <ControlledInput
                label="End Date"
                name="endDate"
                type="date"
                register={register("endDate", {
                  required: "End date is required",
                })}
                placeholder=""
                error={errors.endDate?.message}
              />
            </div>

            <ControlledInput
              label="Progress (%)"
              name="progress"
              type="number"
              register={register("progress", {
                required: "Progress is required",
                min: { value: 0, message: "Progress must be at least 0" },
                max: { value: 100, message: "Progress cannot exceed 100" },
                valueAsNumber: true,
              })}
              placeholder="0-100"
              error={errors.progress?.message}
            />

            <ControlledInput
              label="Budget ($)"
              name="budget"
              type="number"
              register={register("budget", {
                required: "Budget is required",
                min: { value: 0, message: "Budget must be positive" },
                valueAsNumber: true,
              })}
              placeholder="Enter budget amount"
              error={errors.budget?.message}
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
              name={mutation.isPending ? "Saving..." : "Save changes"}
              type="submit"
              disabled={!isDirty || mutation.isPending}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
