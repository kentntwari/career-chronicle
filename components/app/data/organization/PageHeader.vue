<script lang="ts" setup>
  import type { Orgs } from "~/types";

  import {
    X as LucideExitIcon,
    Flag as LucideFlagIcon,
    ChevronRight as LucideChevronRightIcon,
  } from "lucide-vue-next";

  const props = defineProps<{
    current: string;
    data: Orgs;
  }>();

  const emit = defineEmits<{
    selected: [org: Orgs[number]["slug"]];
  }>();

  const selectItems = computed(() => props.data.map(({ name }) => name));

  // TODO:Eventually, create a composable to handle browser history change
  function handleChange(value: Orgs[number]["name"]) {
    const selected = props.data.find((org) => org.name === value);
    if (!selected) return;
    emit("selected", selected.slug);
  }
</script>

<template>
  <header
    class="w-full min-h-12 xl:min-h-16 bg-neutral-grey-200 px-3 py-2 grid"
    role="navigation"
  >
    <div class="container flex items-center justify-between">
      <div class="flex items-center gap-x-1">
        <figure
          class="w-8 xl:w-32 xl:p-2 h-8 bg-[#3E4756] flex justify-center xl:justify-start items-center rounded-lg xl:space-x-2"
        >
          <lucide-flag-icon :size="20" color="white" fill="white" />
          <span class="hidden xl:block text-neutral-grey-100 text-sm"
            >Organization</span
          >
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
          :placeholder="'Select an organization'"
          :classes="{ trigger: 'h-8' }"
          @update:selected="(org) => handleChange(org)"
        />
      </div>

      <nuxt-link to="/organizations">
        <span class="md:hidden">
          <lucide-exit-icon :size="20" color="#3E4756" stroke-width="3" />
        </span>
        <span class="hidden md:block uppercase text-neutral-grey-1300"
          >Exit</span
        >
      </nuxt-link>
    </div>
  </header>
</template>
