<script lang="ts" setup>
  import { MapPin as LucideMapPinIcon } from "lucide-vue-next";

  interface Props {
    data: {
      title: string;
      slug: string;
    };
    parentOrganization: string;
  }

  const props = defineProps<Props>();

  const positionUrl = computed(
    () =>
      `/organization/${props.parentOrganization}/position/${props.data.slug}`
  );
</script>

<template>
  <context-menu-root>
    <context-menu-trigger as-child>
      <NuxtLink
        :to="encodeURI(positionUrl)"
        class="hover:bg-neutral-grey-700 inline-flex items-center gap-x-2"
      >
        <lucide-map-pin-icon :size="18"></lucide-map-pin-icon>
        <span class="font-medium capitalize">{{ data.title }}</span>
      </NuxtLink>
    </context-menu-trigger>
    <context-menu-portal>
      <context-menu-content
        class="min-w-[150px] z-30 bg-[#fff] outline-none rounded-md p-[4px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade space-y-1"
        :side-offset="20"
      >
        <context-menu-item
          value="Open new tab"
          class="group text-xs leading-none text-neutral-grey-1000 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-4 select-none outline-none data-[disabled]:text-neutral-grey-600 data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-grey-300 data-[highlighted]:text-neutral-grey-1300"
          @select="openNewTab(positionUrl)"
        >
          Open new tab
        </context-menu-item>
        <context-menu-item
          value="Change title"
          class="group text-xs leading-none text-neutral-grey-1000 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-4 select-none outline-none data-[disabled]:text-neutral-grey-600 data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-grey-300 data-[highlighted]:text-neutral-grey-1300"
        >
          Change title
        </context-menu-item>
        <context-menu-item
          value="Delete position"
          class="group text-xs leading-none text-danger-700 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-4 select-none outline-none data-[disabled]:text-neutral-grey-600 data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-grey-300 data-[highlighted]:text-neutral-grey-1300"
        >
          Delete position
        </context-menu-item>
      </context-menu-content>
    </context-menu-portal>
  </context-menu-root>
</template>
