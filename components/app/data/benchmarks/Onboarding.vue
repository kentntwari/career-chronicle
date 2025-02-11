<script lang="ts" setup>
  import type { Benchmark } from "~/types";

  import * as benchmarks from "~/constants/benchmarks";

  defineProps<{
    currentBenchmark: Benchmark;
  }>();
</script>

<template>
  <div v-if="currentBenchmark === benchmarks.ACHIEVEMENTS" class="font-medium">
    <p>It may take a while before your first achievement.</p>
    <br />
    <p>But it’s never too late to get started.</p>
    <br />
    <p>
      Hit the <span class="lg:hidden">"+" </span>
      <span class="hidden lg:inline-block">“ADD NEW” </span> button when you’re
      ready.
    </p>
  </div>
  <div
    v-else-if="currentBenchmark === benchmarks.CHALLENGES"
    class="font-medium"
  >
    <p>Every position involves some levels of challenges.</p>
    <br />
    <p>It's good not to lose tracks of what needs to be taken care of.</p>
    <br />
    <p>
      Hit the <span class="lg:hidden">"+" </span>
      <span class="hidden lg:inline-block">“ADD NEW” </span>button to get
      started.
    </p>
  </div>
  <div v-else-if="currentBenchmark === benchmarks.FAILURES" class="font-medium">
    <p>Some we win, some we lose. That's life.</p>
    <br />
    <p>Failures sometimes occur and they are part of an experience.</p>
    <br />
    <p>Hit the <span class="lg:hidden">"+" </span> button when you’re ready.</p>
  </div>
  <div v-else class="font-medium">
    <p>Projects are the most exciting part.</p>
    <br />
    <p>They are designed to make you shine.</p>
    <br />
    <p>
      Hit the <span class="lg:hidden">"+"</span>
      <span class="hidden lg:inline-block">“ADD NEW” </span> button to get
      started.
    </p>
  </div>
</template>
