<script setup lang="ts">
  import { cn } from "~/lib/cn";
  import { cva } from "class-variance-authority";

  const buttonVariants = cva(
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

  interface Props {
    variant?: NonNullable<Parameters<typeof buttonVariants>[0]>["variant"];
    size?: NonNullable<Parameters<typeof buttonVariants>[0]>["size"];
    as?: string;
  }

  // eslint-disable-next-line vue/define-macros-order
  withDefaults(defineProps<Props>(), {
    as: "button",
  });
</script>

<template>
  <component
    :is="as"
    :class="cn(buttonVariants({ variant, size }))"
    :type="$attrs.type ?? 'button'"
  >
    <slot />
  </component>
</template>
