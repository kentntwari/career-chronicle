<script lang="ts" setup>
  import type { Plan } from "@prisma/client";

  defineProps<{
    orgs: string | number;
  }>();

  const plan = useState<Plan>("user-plan");
</script>

<template>
  <header
    class="banner"
    role="banner"
    aria-label="start of available organizations limits"
  >
    <p class="banner-title">
      Record up to {{ plan.maxOrganizations }} organizations
      {{ plan.tier === "FREE" ? "for free" : "" }}. Upgrades coming soon
    </p>
    <small
      class="banner-footer"
      aria-label="end of available organization limits"
    >
      {{ orgs }}/{{ plan.maxOrganizations }} organizations created
    </small>
  </header>
</template>
