<script lang="ts" setup>
  import type { Plan } from "@prisma/client";

  interface Props {
    positions: string | number;
  }

  defineProps<Props>();

  const plan = useState<Plan>("user-plan");
</script>

<template>
  <header
    class="banner"
    role="banner"
    aria-label="start of available positions limits"
  >
    <p class="banner-title">
      Record up to {{ plan.maxPositions }} within each organization
      {{ plan.tier === "FREE" ? "for free" : "" }}. Upgrades coming soon
    </p>
    <small
      class="banner-footer"
      role="region"
      aria-label="end of available positions limits"
    >
      {{ positions }}/{{ plan.maxPositions }} created
    </small>
  </header>
</template>
