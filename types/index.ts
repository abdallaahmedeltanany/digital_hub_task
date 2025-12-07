export type UserRole = "Admin" | "Manager" | "User";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Project {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  progress: number;
  budget: number;
}
export interface ITask {
  id: number;
  projectId: number;
  title: string;
  status: "Not Started" | "In Progress" | "Completed" | "Pending" | string;
  priority: "High" | "Medium" | "Low" | string;
  assignedTo: number;
}
