<script lang="ts" setup>
  import {
    Flag as LucideFlagIcon,
    MapPin as LucideMapPinIcon,
    ChevronRight as LucideChevronRightIcon,
  } from "lucide-vue-next";

  defineProps<{
    target: "ORGANIZATION" | "POSITION";
  }>();
</script>

<template>
  <div
    class="w-full min-h-12 bg-neutral-grey-200 px-3 py-2 border-b border-neutral-grey-600"
  >
    <div class="container flex items-center justify-between">
      <div class="flex items-center space-x-1">
        <figure
          class="w-8 h-8 bg-[#3E4756] flex justify-center items-center rounded-lg"
        >
          <lucide-flag-icon
            :size="20"
            color="white"
            fill="white"
            v-show="target === 'ORGANIZATION'"
          />

          <lucide-map-pin-icon
            :size="20"
            color="white"
            v-show="target === 'POSITION'"
          />
        </figure>
        <figure class="px-1">
          <lucide-chevron-right-icon
            :size="16"
            color="#3E4756"
            stroke-width="3"
          />
        </figure>
        <div
          class="w-40 h-8 bg-neutral-grey-600 animate-pulse rounded-md"
        ></div>
      </div>
      <div class="w-5 h-5 bg-neutral-grey-600 animate-pulse rounded-full"></div>
    </div>
  </div>
</template>
