import React from "react";

export const Input = React.forwardRef(function Input(
  { className = "", type = "text", ...props },
  ref
) {
  const classes = [
    "flex h-10 w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <input ref={ref} type={type} className={classes} {...props} />;
});
