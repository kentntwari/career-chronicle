<script setup lang="ts">
  import type { Plan } from "@prisma/client";

  import { Analytics as VercelAnalytics } from "@vercel/analytics/nuxt";
  import { SpeedInsights as VercelSpeedInsights } from "@vercel/speed-insights/nuxt";

  useHead({
    title: "Career Journey",
    htmlAttrs: {
      lang: "en",
    },
    bodyAttrs: {
      class: "font-body text-base text-body",
    },
  });

  const plan = useState<Plan>("user-plan");

  const route = useRoute();

  await callOnce(async () => {
    if (useNuxtApp().$auth.loggedIn) {
      plan.value = await useRequestFetch()<Plan>("/api/user/plan");
    }
  });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <VercelAnalytics />
    <VercelSpeedInsights />
  </NuxtLayout>
</template>
