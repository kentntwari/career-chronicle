<script lang="ts" setup>
  import { cn } from "@/lib/cn";

  const open = ref(false);

  function closeModal() {
    open.value = false;
  }
</script>

<template>
  <dialog-root v-model:open="open">
    <dialog-trigger as="div">
      <slot name="trigger" />
    </dialog-trigger>
    <dialog-portal>
      <dialog-overlay
        id="overlay"
        class="fixed inset-0 bg-gradient-to-t from-[#000] to-[#000]/20"
      />
      <dialog-content
        :class="
          cn(
            'fixed z-10 bottom-0 left-0 right-0 h-[340px] bg-[#fff] p-4 space-y-6',
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
        <dialog-title as="span">
          Write the name of an organization you were or are currently part of
        </dialog-title>
        <visually-hidden
          ><dialog-description></dialog-description
        ></visually-hidden>
        <slot :close="closeModal" />
      </dialog-content>
    </dialog-portal>
  </dialog-root>
</template>
