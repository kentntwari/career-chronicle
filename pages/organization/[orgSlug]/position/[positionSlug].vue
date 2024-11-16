<script lang="ts" setup>
  import type { SingleOrg } from "~/types";

  definePageMeta({
    layout: false,
  });
</script>

<template>
  <NuxtLayout name="parent-organization">
    <template #default="{ organization }: { organization: SingleOrg }">
      <div v-if="!organization.hasCreatedPositionBefore">
        There appears to be no result for this position
        <app-create-position-btn />
      </div>
      <NuxtLayout
        name="parent-position"
        :parent-organization="organization.slug"
      >
        WDEW
      </NuxtLayout>
    </template>
  </NuxtLayout>
</template>
