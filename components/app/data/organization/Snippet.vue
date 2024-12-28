<script lang="ts" setup>
  import { CURRENT_ORGANIZATION } from "~/constants/routeNames";
  import { Flag as LucideFlagIcon } from "lucide-vue-next";

  interface Props {
    data: {
      name: string;
      slug: string;
    };
  }

  defineProps<Props>();

  const emit = defineEmits<{
    edit: [void];
    delete: [void];
  }>();
</script>

<template>
  <context-menu-root>
    <context-menu-trigger as-child>
      <NuxtLink
        :to="encodeURI(`/organization/${data.slug}`)"
        class="hover:bg-neutral-grey-700 inline-flex items-center gap-x-2"
      >
        <lucide-flag-icon :size="18" class="fill-body"></lucide-flag-icon>
        <span class="font-medium capitalize">{{ data.name }}</span>
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
          @select="
            async () =>
              await navigateTo(
                {
                  name: CURRENT_ORGANIZATION,
                  params: {
                    orgSlug: data.slug,
                  },
                },
                {
                  open: {
                    target: '_blank',
                  },
                }
              )
          "
        >
          Open new tab
        </context-menu-item>
        <context-menu-item
          value="Change name"
          class="group text-xs leading-none text-neutral-grey-1000 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-4 select-none outline-none data-[disabled]:text-neutral-grey-600 data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-grey-300 data-[highlighted]:text-neutral-grey-1300"
          @select="emit('edit')"
        >
          Change name
        </context-menu-item>
        <context-menu-item
          value="Delete Organization"
          class="group text-xs leading-none text-danger-700 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-4 select-none outline-none data-[disabled]:text-neutral-grey-600 data-[disabled]:pointer-events-none data-[highlighted]:bg-neutral-grey-300 data-[highlighted]:text-neutral-grey-1300"
          @select="emit('delete')"
        >
          Delete organization
        </context-menu-item>
      </context-menu-content>
    </context-menu-portal>
  </context-menu-root>
</template>
