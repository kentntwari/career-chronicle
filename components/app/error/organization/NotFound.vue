<script lang="ts" setup>
  import type { Orgs } from "~/types";

  import { TriangleAlert as LucideTriangleAlertIcon } from "lucide-vue-next";

  import { CURRENT_ORGANIZATION } from "~/constants/routeNames";

  const props = defineProps<{
    organization: string;
    allOrgs: Orgs;
  }>();

  async function handleRedirect(org: Orgs[number]["name"]) {
    const orgSlug = props.allOrgs.find(({ name }) => name === org);
    if (!orgSlug) return;
    clearError();
    return await navigateTo({
      name: CURRENT_ORGANIZATION,
      params: {
        orgSlug: orgSlug.slug,
      },
    });
  }
</script>

<template>
  <div class="container nested-container error-container">
    <div class="space-y-6">
      <lucide-triangle-alert-icon :size="32" class="text-[#816841]" />
      <p class="font-medium text-base lg:text-xl whitespace-pre-line">
        <span class="block"
          >Hmm, there appears to be no results for the '{{ organization }}'
          organization.</span
        ><br />
        <span class="block">Try selecting one from this list</span>
      </p>
      <ui-select
        :items="allOrgs.map(({ name }) => name)"
        :placeholder="'Select an organization'"
        :classes="{ trigger: 'bg-[#fff]' }"
        @update:selected="(org) => handleRedirect(org)"
      />
    </div>
  </div>
</template>
