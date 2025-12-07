/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { store } from "@/store";
import { loadUserFromStorage } from "@/store/authSlice";
import { ReactNode, useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRouter } from "next/navigation";

const queryClient = new QueryClient();

function ReduxInnerProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const { token } = store.getState().auth;
      const currentPath = window.location.pathname;

      if (!token && currentPath !== "/auth") {
        router.replace("/auth");
      }

      if (token && currentPath === "/auth") {
        router.replace("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <>{children}</>;
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ReduxInnerProvider>
          {children}
          <ReactQueryDevtools />
        </ReduxInnerProvider>
      </QueryClientProvider>
    </Provider>
  );
}
