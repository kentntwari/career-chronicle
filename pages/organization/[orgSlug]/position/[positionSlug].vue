<script lang="ts" setup>
  import type { SingleOrg } from "~/types";

  definePageMeta({
    layout: false,
  });
</script>

<template>
  <NuxtLayout name="parent-organization">
    <template #default="{ organization }: { organization: SingleOrg | null }">
      <NuxtLayout
        name="parent-position"
        :parent-organization="organization?.slug ?? ''"
      >
        WDEW
      </NuxtLayout>
    </template>
  </NuxtLayout>
</template>
