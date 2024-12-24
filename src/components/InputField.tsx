import { FieldError } from "react-hook-form";
import React from "react";

type InputFieldProps = {
  label: string;
  type?: string;
  register?: any; // Made optional for flexibility
  name?: string;   // Made optional for flexibility
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  as?: "input" | "select"; // New prop to determine the rendered element
  children?: React.ReactNode; // For rendering <option> elements in <select>
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> & React.SelectHTMLAttributes<HTMLSelectElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  as = "input", // Default to 'input'
  children,
  inputProps,
}: InputFieldProps) => {
  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-2 w-full md:w-1/4"}>
      <label className="text-xs text-gray-500">{label}</label>
      {as === "select" ? (
        <select
          {...(register && name ? register(name) : {})}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...inputProps}
          defaultValue={defaultValue}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          {...(register && name ? register(name) : {})}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...inputProps}
          defaultValue={defaultValue}
        />
      )}
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
