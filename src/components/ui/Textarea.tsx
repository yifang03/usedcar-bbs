"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(({ label, error, className = "", ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1 text-text">{label}</label>}
      <textarea
        ref={ref}
        className={`w-full min-h-[100px] px-3 py-2 text-sm bg-white border rounded-lg outline-none resize-y transition-colors shadow-sm
          ${error ? "border-danger" : "border-border focus:border-primary"}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-0.5 text-xs text-danger">{error}</p>}
    </div>
  );
});

Textarea.displayName = "Textarea";
export default Textarea;
