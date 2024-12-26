<script setup lang="ts">
  import type { HTMLAttributes } from "vue";
  import { cn } from "~/lib/cn";
  import { useVModel } from "@vueuse/core";

  const props = defineProps<{
    defaultValue?: string | number;
    modelValue?: string | number;
    class?: HTMLAttributes["class"];
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
  <input
    v-model="modelValue"
    v-bind="$attrs"
    :class="
      cn(
        'flex h-10 w-full text-neutral-grey-1300 rounded-md border border-neutral-grey-700 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 outline-none',
        props.class
      )
    "
  />
</template>
