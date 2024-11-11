<script lang="ts" setup>
  import type { Plan } from "@prisma/client";

  interface Props {
    orgs: string | number;
  }

  defineProps<Props>();

  const plan = useState<Plan>("user-plan");
</script>

<template>
  <header
    class="banner"
    role="banner"
    aria-label="start of available organizations limits"
  >
    <p class="banner-title">
      Record up to {{ plan.maxOrganizations }}
      {{ plan.tier === "FREE" ? "for free" : "" }}. Upgrades coming soon
    </p>
    <small role="region" aria-label="end of available organizations limits">
      {{ orgs }}/{{ plan.maxOrganizations }} created
    </small>
  </header>
</template>
