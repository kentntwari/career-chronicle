<script lang="ts" setup>
  import type { Orgs } from "~/types";

  import {
    X as LucideExitIcon,
    Flag as LucideFlagIcon,
    ChevronRight as LucideChevronRightIcon,
  } from "lucide-vue-next";

  defineProps<{
    organization: string;
  }>();

  const emit = defineEmits<{
    selected: [org: Orgs[number]["slug"]];
  }>();

  const { data: cachedOrgs } = useNuxtData<Orgs>("orgs");

  const userOrgs = useState<Orgs>("orgs", () => []);
  const selectItems = computed(() => userOrgs.value.map(({ name }) => name));

  const nuxtApp = useNuxtApp();

  watch(
    () => cachedOrgs.value,
    async (val) => {
      if (val) userOrgs.value = val;
      else {
        userOrgs.value = await useRequestFetch()<Orgs>("/api/organizations");
        nuxtApp.payload.data.orgs = userOrgs.value;
      }
    },
    {
      immediate: true,
    }
  );

  // TODO:Eventually, create a composable to handle browser history change
  function handleChange(value: Orgs[number]["name"]) {
    const selected = userOrgs.value.find((org) => org.name === value);
    if (!selected) return;
    emit("selected", selected.slug);
  }
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
          <lucide-flag-icon :size="20" color="white" fill="white" />
        </figure>
        <figure class="px-1">
          <lucide-chevron-right-icon
            :size="16"
            color="#3E4756"
            stroke-width="3"
          />
        </figure>
        <ui-select
          :default="organization"
          :items="selectItems"
          :placeholder="'Select an organization'"
          @update:selected="(org) => handleChange(org)"
        />
      </div>

      <nuxt-link to="/organizations">
        <span class="md:hidden">
          <lucide-exit-icon :size="20" color="#3E4756" stroke-width="3" />
        </span>
      </nuxt-link>
    </div>
  </header>
</template>
