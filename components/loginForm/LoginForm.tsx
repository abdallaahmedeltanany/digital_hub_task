/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
import ControlledInput from "../controlledComponents/ControlledInput";
import { Label } from "../ui/label";
import ControlledButton from "../controlledComponents/ControlledButton";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validations";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { loadUserFromStorage, login } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import type { RootState } from "@/store";
import { toast } from "react-toastify";
import { LogIn, Shield, Sparkles } from "lucide-react";
import { useSpring, animated } from "@react-spring/web";
import { Spinner } from "../ui/spinner";

type LoginInputs = z.infer<typeof loginSchema>;

interface LoginResponse {
  accessToken: string;
  user: any;
}

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const formAnimation = useSpring({
    from: {
      opacity: 0,
      transform: "translateX(-2000px) scale(0.95)",
    },
    to: {
      opacity: 1,
      transform: "translateX(0px) scale(1)",
    },
    config: {
      tension: 120,
      friction: 22,
    },
  });
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const apiCall = async (payload: LoginInputs): Promise<LoginResponse> => {
    const response = await api.post("/login", payload);
    return response.data;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: apiCall,
    onSuccess: (data) => {
      dispatch(login({ token: data.accessToken, user: data.user }));
      router.push("/dashboard");
      toast.success("Welcome Back!");
    },
    onError: () => {
      toast.error("Something Wrong happened");
    },
  });

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  const onSubmit = (data: LoginInputs) => {
    mutate(data);
  };

  return (
    <div className="relative flex max-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="relative w-full max-w-md">
        <animated.form
          style={formAnimation}
          className="relative h-fit space-y-6 rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="text-center">
            <div className="mb-1 flex justify-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
                <div className="absolute -right-1 -top-1">
                  <Sparkles className="h-5 w-5 animate-pulse text-yellow-400" />
                </div>
              </div>
            </div>

            <h1 className="mb-1 bg-linear-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-3xl font-bold text-transparent">
              Welcome Back
            </h1>
            <p className="text-sm font-medium text-gray-600">
              Sign in to continue to your dashboard
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Enter your credentials
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <ControlledInput
              name="email"
              type="text"
              label="Email"
              placeholder="name@example.com"
              register={register("email")}
              error={errors.email?.message}
            />
            <ControlledInput
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              register={register("password")}
              error={errors.password?.message}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="font-medium text-gray-700">Remember me</span>
            </label>
            <button
              type="button"
              className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <div className="space-y-4 text-center">
            <ControlledButton
              type="submit"
              variant="outline"
              disabled={isPending}
              name={isPending ? <Spinner /> : "Login"}
            />

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <Shield className="h-4 w-4 text-blue-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-900">
                  Secure Login
                </p>
                <p className="mt-0.5 text-xs text-blue-700">
                  Your data is protected with end-to-end encryption
                </p>
              </div>
            </div>
          </div>
        </animated.form>

        <p className="mt-6 text-center text-xs text-gray-500">
          By signing in, you agree to our{" "}
          <button
            type="button"
            className="font-medium text-gray-700 hover:underline"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="font-medium text-gray-700 hover:underline"
          >
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
