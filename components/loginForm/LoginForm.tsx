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

type LoginInputs = z.infer<typeof loginSchema>;

interface LoginResponse {
  accessToken: string;
  user: any;
}

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

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
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    }
  }, []);

  const onSubmit = (data: LoginInputs) => {
    mutate(data);
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <form
        className="bg-gray-50 w-[500px] border border-gray-200 shadow-xl rounded-2xl p-2 space-y-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="w-full flex justify-center items-center">
          <Label className="font-bold text-2xl text-gray-700 px-1 text-center">
            Login
          </Label>
        </div>
        <ControlledInput
          name="email"
          type="text"
          label="Email"
          placeholder="Please Enter your Email"
          register={register("email")}
          error={errors.email?.message}
        />
        <ControlledInput
          name="password"
          type="password"
          label="Password"
          placeholder="Please Enter your Password"
          register={register("password")}
          error={errors.password?.message}
        />
        <div className="w-full justify-center flex">
          <ControlledButton
            name={isPending ? "Logging in..." : "Login"}
            type="submit"
            variant="outline"
            disabled={isPending}
          />
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
