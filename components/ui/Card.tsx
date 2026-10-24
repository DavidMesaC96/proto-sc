import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  as?: "div" | "section" | "article";
}

export default function Card({
  children,
  className = "",
  hover = false,
  as: Tag = "div",
  ...rest
}: CardProps) {
  const classes = ["glass-card", hover && "glass-card-hover", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
