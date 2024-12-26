<script lang="ts" setup>
  import type { OrgPos } from "~/types";

  import { useWindowSize } from "@vueuse/core";

  import {
    X as LucideExitIcon,
    MapPin as LucideMapPinIcon,
    ChevronRight as LucideChevronRightIcon,
    Info as LucideInfoIcon,
  } from "lucide-vue-next";

  const props = defineProps<{
    data: OrgPos;
    current: string;
    startedAt?: string;
    description?: string;
  }>();

  const emit = defineEmits<{
    selected: [pos: OrgPos[number]["slug"]];
  }>();

  const route = useRoute();

  const selectItems = computed(() => props.data.map(({ title }) => title));

  // TODO:Eventually, create a composable to handle browser history change
  // TODO: ensure that no title is duplicatd
  function handleChange(value: OrgPos[number]["title"]) {
    const selected = props.data.find((pos) => pos.title === value);
    if (!selected) return;
    emit("selected", selected.slug);
  }

  const { width } = useWindowSize();
</script>

<template>
  <header
    class="w-full min-h-12 bg-neutral-grey-200 px-3 py-2"
    role="navigation"
  >
    <div class="container flex items-center justify-between">
      <div class="flex items-center space-x-1">
        <figure
          class="w-8 h-8 bg-[#3E4756] flex justify-center items-center rounded-lg"
        >
          <lucide-map-pin-icon :size="20" color="white" />
        </figure>
        <figure class="px-1">
          <lucide-chevron-right-icon
            :size="16"
            color="#3E4756"
            stroke-width="3"
          />
        </figure>

        <ui-select
          :default="current"
          :items="selectItems"
          :placeholder="'Select a position'"
          @update:selected="(pos) => handleChange(pos)"
        />

        <ui-popover
          side="bottom"
          :side-offset="10"
          :align-offset="0"
          :align="width > 1024 ? 'start' : 'end'"
          class="space-y-2"
          v-if="!!startedAt || !!description"
        >
          <template #trigger="{ open }">
            <button type="button" @click="open()" class="pl-2">
              <lucide-info-icon :size="20" color="#3E4756" stroke-width="3" />
            </button>
          </template>
          <template #content>
            <span
              class="capitalize font-medium text-sm"
              :class="[!startedAt ? 'italic text-neutral-grey-900' : '']"
            >
              {{ !!startedAt ? `Started ${startedAt}` : "No date provided" }}
            </span>
            <small
              class="block text-sm"
              :class="[!description ? 'italic text-neutral-grey-900' : '']"
            >
              {{ !!description ? `${description}` : "No description provided" }}
            </small>
          </template>
        </ui-popover>
      </div>

      <nuxt-link :to="`/organization/${stringifyRoute(route.params.orgSlug)}`">
        <span class="md:hidden">
          <lucide-exit-icon :size="20" color="#3E4756" stroke-width="3" />
        </span>
      </nuxt-link>
    </div>
  </header>
</template>
