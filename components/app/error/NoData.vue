<script lang="ts" setup>
  import { H3Error } from "h3";
  import { FetchError } from "ofetch";
  import { TriangleAlert as LucideTriangleAlertIcon } from "lucide-vue-next";

  const emit = defineEmits<{
    reload: [void];
  }>();

  const props = defineProps<{
    error?: H3Error | FetchError | null;
  }>();

  const statusCode = computed(() => {
    if (!props.error) return undefined;

    if (props.error instanceof FetchError || props.error instanceof H3Error)
      return props.error.statusCode;
  });

  const retries = useState("retry-state", () => 0);

  function handleReload() {
    retries.value++;
    if (retries.value > 3)
      throw createError({
        statusCode: 500,
        statusMessage:
          "There's clearly something wrong. We apologize for the inconvenience.",
        fatal: true,
      });
    else emit("reload");
  }
</script>

<template>
  <div class="error-container">
    <div class="space-y-6">
      <lucide-triangle-alert-icon :size="32" class="text-[#816841]" />
      <p class="font-medium text-sm lg:text-xl">
        Sorry, it seems we couldn’t retrieve your data.
      </p>
    </div>

    <slot :code="statusCode" :handleReload="handleReload">
      <ui-button
        variant="link"
        class="mt-12 lg:mt-14 text-sm lg:text-base"
        @click="handleReload"
        >Reload</ui-button
      >
    </slot>
  </div>
</template>
