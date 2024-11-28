<script lang="ts" setup>
  import { nanoid } from "nanoid";
  import { cn } from "~/lib/cn";
</script>

<template>
  <div :class="cn('px-3 py-10 container space-y-2', $attrs.class ?? '')">
    <div
      v-for="_el in 3"
      :key="nanoid"
      class="w-40 h-5 bg-neutral-grey-600 animate-pulse rounded-md"
    ></div>
  </div>
</template>
