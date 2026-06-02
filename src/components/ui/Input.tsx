"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className = "", ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1 text-text">{label}</label>}
      <input
        ref={ref}
        className={`w-full h-10 px-3 text-sm bg-white border rounded-lg outline-none transition-colors shadow-sm
          ${error ? "border-danger" : "border-border focus:border-primary"}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-0.5 text-xs text-danger">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
