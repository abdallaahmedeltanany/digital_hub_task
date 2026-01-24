import React from "react";
import { Button } from "../ui/button";

interface IControlledButton {
  variant:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null;
  name: string | React.ReactNode;
  type: "button" | "submit" | "reset" | undefined;
  disabled: boolean;
}
const ControlledButton = ({
  variant,
  name,
  type,
  disabled,
}: IControlledButton) => {
  return (
    <Button
      variant={variant}
      type={type}
      className="w-[200px] border-2 border-gray-800 font-semibold text-lg text-gray-700"
      disabled={disabled}
    >
      {name}
    </Button>
  );
};

export default ControlledButton;
