import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/30 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-lg hover:shadow-xl",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/30 dark:bg-red-600 dark:hover:bg-red-500 shadow-lg hover:shadow-xl",
        outline:
          "border-2 border-blue-600/30 bg-transparent text-blue-400 hover:bg-blue-600/10 hover:border-blue-500 hover:text-blue-300 dark:border-blue-400/40 dark:text-blue-300 dark:hover:bg-blue-400/10 dark:hover:border-blue-300 shadow-sm hover:shadow-md",
        secondary:
          "bg-slate-600 text-white hover:bg-slate-700 focus-visible:ring-slate-500/30 dark:bg-slate-700 dark:hover:bg-slate-600 shadow-md hover:shadow-lg",
        ghost:
          "text-gray-300 hover:bg-white/10 hover:text-white dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300 dark:text-blue-400 dark:hover:text-blue-300",
        success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500/30 dark:bg-green-600 dark:hover:bg-green-500 shadow-lg hover:shadow-xl",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-500/30 dark:bg-yellow-600 dark:hover:bg-yellow-500 shadow-lg hover:shadow-xl",
        info: "bg-cyan-600 text-white hover:bg-cyan-700 focus-visible:ring-cyan-500/30 dark:bg-cyan-600 dark:hover:bg-cyan-500 shadow-lg hover:shadow-xl",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
