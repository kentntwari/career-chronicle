<script setup lang="ts">
  import { useThrottleFn } from "@vueuse/core";

  import {
    type PopoverContentEmits,
    type PopoverContentProps,
    useForwardPropsEmits,
  } from "radix-vue";
  import { cn } from "@/lib/cn";

  interface Props extends PopoverContentProps {
    class?: string;
  }

  const props = defineProps<Props>();
  const emits = defineEmits<PopoverContentEmits>();

  const forwarded = useForwardPropsEmits(props, emits);

  const open = ref(false);

  const throttledFn = useThrottleFn(() => {
    if (open.value) open.value = false;
    else open.value = true;
  }, 500);
</script>

<template>
  <popover-root :open="open">
    <popover-anchor as-child>
      <slot name="trigger" :open="throttledFn"></slot>
    </popover-anchor>

    <popover-portal>
      <popover-content
        :class="
          cn(
            'rounded-lg p-3 max-w-[240px] bg-[#fff] text-neutral-grey-1000 will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade',
            props.class
          )
        "
        @interact-outside="open = false"
        v-bind="{ ...forwarded, ...$attrs }"
      >
        <slot name="content" :close="() => (open = false)"></slot>
      </popover-content>
      <slot></slot>
    </popover-portal>
  </popover-root>
</template>
