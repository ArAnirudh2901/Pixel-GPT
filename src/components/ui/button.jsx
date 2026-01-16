import React from "react";

export const Button = React.forwardRef(function Button(
  { className = "", variant = "default", size = "default", ...props },
  ref
) {
  const variants = {
    default:
      "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black",
    outline:
      "border border-gray-200 bg-white hover:bg-gray-50 text-gray-900",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-6",
  };

  const classes = [
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50",
    variants[variant] || variants.default,
    sizes[size] || sizes.default,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button ref={ref} className={classes} {...props} />;
});
