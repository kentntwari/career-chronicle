<script lang="ts" setup>
  import type { SingleOrg } from "~/types";

  definePageMeta({
    layout: false,
  });

  const nuxtApp = useNuxtApp();

  const router = useRouter();

  const addBenchmark = ref(false);

  const benchmarks = [
    "project",
    "achievement",
    "challenge",
    "failure",
  ] as const;
  const color = (b: (typeof benchmarks)[number]) => {
    switch (true) {
      case b === "project":
        return "bg-[#A2ACBD]";
      case b === "achievement":
        return "bg-success-300";
      case b === "challenge":
        return "bg-neutral-grey-500";
      case b === "failure":
        return "bg-danger-300";
      default:
        return "";
    }
  };
  function hasCreatedBenchmarks(org: SingleOrg) {
    if (
      org.hasCreatedAchievementBefore ||
      org.hasCreatedChallengeBefore ||
      org.hasCreatedFailureBefore ||
      org.hasCreatedProjectBefore
    )
      return true;

    return false;
  }
</script>

<template>
  <NuxtLayout
    name="parent-organization"
    @selected="(org) => navigateTo(`/organization/${org}`)"
  >
    <template #default="{ organization }: { organization: SingleOrg }">
      <NuxtLayout
        name="parent-position"
        :parent-organization="organization.slug"
        @selected="(position) => router.push(`/position/${position}`)"
      >
        <main>
          <div
            v-if="organization && !hasCreatedBenchmarks(organization)"
            class="mt-[4.5rem] px-3 container text-balance font-medium"
          >
            <p>
              Every position involves its own achievements, challenges, failures
              or even projects.
            </p>
            <br />
            <p>It can be easy to keep count of all that.</p>
            <br />
            <p>Let’s make sure it is documented for future you.</p>
            <ui-button
              class="mt-10"
              @click="addBenchmark = true"
              v-show="!addBenchmark"
              >Get started</ui-button
            >
            <section
              v-show="addBenchmark"
              class="mt-10 p-4 bg-[#fff] rounded-lg"
            >
              <span class="text-base font-medium"
                >What do you want to add first?</span
              >
              <div class="flex flex-col gap-2">
                <div
                  v-for="benchmark in benchmarks"
                  class="h-20 flex flex-col items-center justify-center rounded-lg"
                  :class="[color(benchmark)]"
                >
                  <span class="font-vol text-base text-neutral-grey-1100">{{
                    benchmark
                  }}</span
                  >>
                </div>
              </div>
            </section>
          </div>
        </main>
      </NuxtLayout>
    </template>
  </NuxtLayout>
</template>
