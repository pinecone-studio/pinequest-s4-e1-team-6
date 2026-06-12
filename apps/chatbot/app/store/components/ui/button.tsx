import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Responsive төрлийг тодорхойлох туслах тип (Жишээ нь: { initial: "sm", sm: "lg" })
type ResponsiveValue<T> =
  | T
  | { initial?: T; sm?: T; md?: T; lg?: T; xl?: T; "2xl"?: T };

interface ResponsiveButtonProps extends Omit<
  React.ComponentProps<"button">,
  "size" | "variant"
> {
  variant?: ResponsiveValue<VariantProps<typeof buttonVariants>["variant"]>;
  size?: ResponsiveValue<VariantProps<typeof buttonVariants>["size"]>;
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ResponsiveButtonProps) {
  // Responsive утгуудыг задлан ангилж Tailwind класс руу хөрвүүлэх туслах функц
  const getResponsiveClasses = () => {
    const classes: string[] = [];

    // Variant задлах
    if (typeof variant === "string") {
      classes.push(buttonVariants({ variant }));
    } else if (variant && typeof variant === "object") {
      if (variant.initial)
        classes.push(buttonVariants({ variant: variant.initial }));
      if (variant.sm)
        classes.push(
          cn(
            variant.sm &&
              `sm:${buttonVariants({ variant: variant.sm }).split(" ").join(" sm:")}`,
          ),
        );
      if (variant.md)
        classes.push(
          cn(
            variant.md &&
              `md:${buttonVariants({ variant: variant.md }).split(" ").join(" md:")}`,
          ),
        );
      if (variant.lg)
        classes.push(
          cn(
            variant.lg &&
              `lg:${buttonVariants({ variant: variant.lg }).split(" ").join(" lg:")}`,
          ),
        );
    }

    // Size задлах
    if (typeof size === "string") {
      classes.push(buttonVariants({ size }));
    } else if (size && typeof size === "object") {
      if (size.initial) classes.push(buttonVariants({ size: size.initial }));
      if (size.sm)
        classes.push(
          cn(
            size.sm &&
              `sm:${buttonVariants({ size: size.sm }).split(" ").join(" sm:")}`,
          ),
        );
      if (size.md)
        classes.push(
          cn(
            size.md &&
              `md:${buttonVariants({ size: size.md }).split(" ").join(" md:")}`,
          ),
        );
      if (size.lg)
        classes.push(
          cn(
            size.lg &&
              `lg:${buttonVariants({ size: size.lg }).split(" ").join(" lg:")}`,
          ),
        );
    }

    return classes;
  };

  // Төлөвийн өгөгдөл (data-attributes)-д зориулж анхны утгыг оноох
  const dataVariant =
    typeof variant === "string" ? variant : variant?.initial || "default";
  const dataSize = typeof size === "string" ? size : size?.initial || "default";

  return (
    <button
      data-slot="button"
      data-variant={dataVariant}
      data-size={dataSize}
      className={cn(
        // Үндсэн суурь классууд (Хэмжээ болон Variant-аас бусад)
        "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        getResponsiveClasses(),
        className,
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
