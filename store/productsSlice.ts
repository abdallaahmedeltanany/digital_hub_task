import { Project } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProjectState {
  projects: Project[];
  filteredProjects: Project[];
  searchQuery: string;
  statusFilter: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  filteredProjects: [],
  searchQuery: "",
  statusFilter: "all",
  isLoading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      state.filteredProjects = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
        applyFilters(state);
      }
    },

    setSearch: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      applyFilters(state);
    },

    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      applyFilters(state);
    },

    clearFilters: (state) => {
      state.searchQuery = "";
      state.statusFilter = "all";
      state.filteredProjects = state.projects;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

const applyFilters = (state: ProjectState) => {
  let filtered = [...state.projects];

  if (state.searchQuery.trim() !== "") {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.id.toString().includes(query) ||
        project.status.toLowerCase().includes(query)
    );
  }

  if (state.statusFilter !== "all") {
    filtered = filtered.filter(
      (project) =>
        project.status.toLowerCase() === state.statusFilter.toLowerCase()
    );
  }

  state.filteredProjects = filtered;
};

export const {
  setProjects,
  setSearch,
  setStatusFilter,
  clearFilters,
  setLoading,
  setError,
  clearError,
  updateProject,
} = projectsSlice.actions;

export default projectsSlice.reducer;
