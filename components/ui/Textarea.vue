<script setup lang="ts">
  import type { HTMLAttributes } from "vue";
  import { cn } from "@/lib/cn";
  import { useVModel } from "@vueuse/core";

  const props = defineProps<{
    class?: HTMLAttributes["class"];
    defaultValue?: string | number;
    modelValue?: string | number;
  }>();

  const emits = defineEmits<{
    (e: "update:modelValue", payload: string | number): void;
  }>();

  const modelValue = useVModel(props, "modelValue", emits, {
    passive: true,
    defaultValue: props.defaultValue,
  });
</script>

<template>
  <textarea
    v-model="modelValue"
    :class="
      cn(
        'flex min-h-20 w-full text-neutral-grey-1300 rounded-md border border-neutral-grey-700 px-3 py-2 text-sm outline-none',
        props.class
      )
    "
  />
</template>
