/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Input } from "../ui/input";
import { FormField } from "../ui/form";
import { Control } from "react-hook-form";
import { Label } from "../ui/label";
import { error } from "console";

interface IControlledInputProps {
  label: string;
  name: string;
  type: string;
  register?: any;
  placeholder: string;
  error?: string;
}
const ControlledInput = ({
  label,
  name,
  type,
  register,
  placeholder,
  error,
}: IControlledInputProps) => {
  return (
    <div>
      <Label className="font-bold text-lg text-gray-700 px-1">{label}</Label>
      <Input
        name={name}
        {...register}
        type={type}
        className="bg-white text-lg font-semibold text-gray-600"
        placeholder={placeholder}
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default ControlledInput;
