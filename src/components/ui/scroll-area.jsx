import React from "react";

export function ScrollArea({ className = "", ...props }) {
  const classes = ["overflow-auto", className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
}
