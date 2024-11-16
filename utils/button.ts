import { cva } from "class-variance-authority";

export const variants = cva(
  "inline-flex items-center justify-center rounded-md uppercase text-sm font-medium disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#816841] text-[#fff]",
        destructive: "bg-danger-700 text-[#fff]",
        neutral:
          "bg-[#fff] text-neutral-grey-1000 border border-neutral-grey-500",
        link: "bg-transparent text-body",
      },
      size: {
        default: "h-10 px-[0.625rem] py-2",
        link: "h-fit p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
