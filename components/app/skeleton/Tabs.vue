<script lang="ts" setup>
  import { nanoid } from "nanoid";
</script>

<template>
  <div class="md:px-1 h-10 rounded-md md:bg-[#fff] flex items-center gap-1.5">
    <div
      v-for="_el in 4"
      :key="nanoid"
      class="w-10 md:w-20 h-10 md:h-7 rounded-lg bg-neutral-grey-600 animate-pulse"
    ></div>
  </div>
</template>
