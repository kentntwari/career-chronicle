<script lang="ts" setup>
  import type { Orgs, OrgPos } from "~/types";

  import { TriangleAlert as LucideTriangleAlertIcon } from "lucide-vue-next";

  import { CURRENT_POSITION } from "~/constants/routeNames";

  const props = defineProps<{
    parentOrganization: Orgs[number]["slug"];
    position: OrgPos[number]["slug"];
    allPositions: OrgPos;
  }>();

  async function handleRedirect(pos: OrgPos[number]["title"]) {
    const position = props.allPositions.find(({ title }) => title === pos);
    if (!position) return;

    clearError();

    return await navigateTo({
      name: CURRENT_POSITION,
      params: {
        orgSlug: props.parentOrganization,
        positionSlug: position.slug,
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
          >Hmm, there appears to be no results for the '{{ position }}' position
          within this organization.</span
        ><br />
        <span class="block">Try selecting one from this list</span>
      </p>
      <ui-select
        :items="allPositions.map(({ title }) => title)"
        :placeholder="'Select position'"
        :classes="{ trigger: 'bg-[#fff]' }"
        @update:selected="(pos) => handleRedirect(pos)"
      />
    </div>
  </div>
</template>
