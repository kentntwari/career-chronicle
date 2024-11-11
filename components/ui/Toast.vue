<script setup lang="ts">
  import { cn } from "~/lib/cn";

  const props = withDefaults(
    defineProps<{
      title: string;
      message?: string;
      type?: "neutral" | "error" | "success";
    }>(),
    {
      type: "neutral",
    }
  );

  const open = ref(false);

  function triggerToast() {
    open.value = false;
    window.setTimeout(() => {
      open.value = true;
    }, 100);
  }

  const rootBgClass = computed(() => {
    if (props.type === "neutral") return "bg-[#fff]";
    if (props.type === "error") return "bg-danger-700";
    if (props.type === "success") return "bg-success-700";
  });

  const titleClass = computed(() => {
    if (props.type === "neutral") return "text-neutral-1300";
    if (props.type === "error") return "text-[#fff]";
    if (props.type === "success") return "text-[#fff]";
  });
</script>

<template>
  <toast-provider :duration="1500">
    <slot :trigger-toast="triggerToast" />

    <toast-root
      v-model:open="open"
      class="rounded-md shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
      :class="rootBgClass"
    >
      <toast-title
        class="[grid-area:_title] mb-[5px] font-medium text-slate12 text-[15px]"
        :class="titleClass"
      >
        {{ title }}
      </toast-title>
      <toast-description v-if="message"> {{ message }} </toast-description>
    </toast-root>
    <toast-viewport
      class="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none"
    />
  </toast-provider>
</template>
