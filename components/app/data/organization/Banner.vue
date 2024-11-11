<script lang="ts" setup>
  import type { Plan } from "@prisma/client";

  defineProps<{
    positions: string | number;
  }>();

  const plan = useState<Plan>("user-plan");
</script>

<template>
  <header
    class="banner"
    role="banner"
    aria-label="start of available positions limits"
  >
    <p class="banner-title">
      Record up to {{ plan.maxPositions }} journeys
      {{ plan.tier === "FREE" ? "for free" : "" }}. Upgrades coming soon
    </p>
    <small class="banner-footer" aria-label="end of available position limits">
      {{ positions }}/{{ plan.maxPositions }} positions created
    </small>
  </header>
</template>
