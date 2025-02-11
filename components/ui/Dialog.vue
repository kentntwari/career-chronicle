<script lang="ts" setup>
  import { useToggle } from "@vueuse/core";
  import { cn } from "@/lib/cn";
  defineOptions({
    inheritAttrs: false,
  });

  const [isOpen, setIsOpen] = useToggle(false);
</script>

<template>
  <dialog-root v-model:open="isOpen">
    <slot name="trigger" :open="() => setIsOpen(true)" />

    <dialog-portal>
      <dialog-overlay
        id="overlay"
        class="fixed inset-0 bg-gradient-to-t from-[#000] to-[#000]/20"
      />
      <dialog-content
        :class="
          cn(
            'fixed z-10 md:top-1/2 bottom-0 md:bottom-auto left-0 md:left-1/2 right-0 md:right-auto min-h-[340px] bg-[#fff] p-4 md:rounded-lg md:-translate-x-1/2 md:-translate-y-1/2',
            $attrs.class!
          )
        "
        @interact-outside="
          (event) => {
            const target = event.target as HTMLElement;
            if (target.id === 'overlay') event.preventDefault();
          }
        "
      >
        <slot :close="() => setIsOpen(false)" />
      </dialog-content>
    </dialog-portal>
  </dialog-root>
</template>
