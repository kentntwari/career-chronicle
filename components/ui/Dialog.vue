<script lang="ts" setup>
  import { useToggle } from "@vueuse/core";
  import { cn } from "@/lib/cn";

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
            'fixed z-10 bottom-0 left-0 right-0 min-h-[340px] bg-[#fff] p-4',
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
