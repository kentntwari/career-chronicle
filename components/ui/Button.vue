<script setup lang="ts">
  import type { ButtonVariants } from "~/types";

  import { cn } from "~/lib/cn";
  import * as b from "@/utils/button";

  interface Props extends ButtonVariants {
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
    :class="cn(b.variants({ variant, size }), $attrs.class ?? '')"
    :type="$attrs.type ?? 'button'"
  >
    <slot></slot>
  </component>
</template>
