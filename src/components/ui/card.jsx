import React from "react";

export function Card({ className = "", ...props }) {
  const classes = [
    "rounded-xl border border-neutral-800 bg-black shadow-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...props} />;
}

export function CardHeader({ className = "", ...props }) {
  const classes = ["px-4 py-3 border-b border-neutral-800 bg-black", className]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
  const classes = ["text-sm font-semibold", className]
    .filter(Boolean)
    .join(" ");
  return <h3 className={classes} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  const classes = ["p-4", className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
}
