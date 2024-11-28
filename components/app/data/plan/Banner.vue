<script lang="ts" setup>
  import type { Plan } from "@prisma/client";
  import type { Benchmark } from "~/types";

  import * as benchmarks from "~/benchmarks";

  interface Props {
    currentCount: string | number;
    target: "ORGANIZATIONS" | "POSITIONS" | Benchmark;
  }

  const props = defineProps<Props>();

  const plan = useState<Plan>("user-plan");

  const totalCount = computed(() => {
    if (props.target === "ORGANIZATIONS") return plan.value.maxOrganizations;
    if (props.target === "POSITIONS") return plan.value.maxPositions;
    if (props.target === benchmarks.ACHIEVEMENTS)
      return plan.value.maxAchievements;
    if (props.target === benchmarks.CHALLENGES) return plan.value.maxChallenges;
    if (props.target === benchmarks.FAILURES) return plan.value.maxFailures;
    if (props.target === benchmarks.PROJECTS) return plan.value.maxProjects;
  });

  const title = computed(() => {
    switch (true) {
      case props.target === "ORGANIZATIONS":
        return `Record up to ${totalCount.value} organizations ${plan.value.tier === "FREE" ? "for free" : ""}. Upgrades coming soon`;

      case props.target === "POSITIONS":
        return `Record up to ${totalCount.value} positions within each organization ${plan.value.tier === "FREE" ? "for free" : ""}. Upgrades coming soon`;

      default:
        return `Record up to ${totalCount.value} ${props.target.toLocaleLowerCase()} at this position ${plan.value.tier === "FREE" ? "for free" : ""}. Upgrades coming soon`;
    }
  });
</script>

<template>
  <header
    class="banner"
    role="banner"
    :aria-label="`start of available ${target.toLocaleLowerCase()} limits`"
  >
    <p class="banner-title">
      {{ title }}
    </p>
    <small
      class="banner-footer"
      role="region"
      :aria-label="`end of available ${target.toLocaleLowerCase()} limits`"
    >
      {{ currentCount }}/{{ totalCount }} created
    </small>
  </header>
</template>
