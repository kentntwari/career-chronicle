<script lang="ts" setup>
  import type { Orgs } from "~/types";

  import { z } from "zod";
  import { newOrg } from "~/utils/zschemas";

  const emit = defineEmits<{
    cancel: [void];
    formSubmitted: [void];
  }>();

  const { errors, handleSubmit, defineField, isSubmitting } = useForm({
    validationSchema: toTypedSchema(newOrg),
  });

  const previousOrgs = ref<Orgs>([]);

  const { data: currentOrgs } = useNuxtData<Orgs>("orgs");

  const onSubmit = handleSubmit((values) => {
    const newOrg = {
      name: values.name.toLowerCase(),
      slug: generateSlug(values.name.toLowerCase()),
    };

    emit("formSubmitted");

    $fetch("/api/organization", {
      method: "POST",
      body: newOrg,
      onRequest() {
        if (currentOrgs.value !== null) {
          previousOrgs.value = currentOrgs.value;
          currentOrgs.value.push(newOrg);
        } else {
          currentOrgs.value = [];
          currentOrgs.value.push(newOrg);
        }
      },
      onRequestError() {
        currentOrgs.value = previousOrgs.value; // Rollback the data if the request failed.
      },
      async onResponse() {
        await refreshNuxtData("orgs"); // Invalidate orgs in the background if the request succeeded.
      },
    });
  });

  const [org, orgAttrs] = defineField("name");
</script>

<template>
  <form @submit="onSubmit" class="space-y-8">
    <ui-input
      type="text"
      v-model="org"
      v-bind="orgAttrs"
      class="border-neutral-grey-500 outline-none"
    />
    <small class="text-xs text-danger-700">{{ errors.name }}</small>
    <div class="w-full flex justify-end items-center gap-2">
      <ui-button
        variant="neutral"
        class="h-9"
        :disabled="isSubmitting"
        @click="emit('cancel')"
        >Cancel</ui-button
      >
      <ui-button type="submit" class="h-9 min-w-20" :disabled="isSubmitting"
        >Save</ui-button
      >
    </div>
  </form>
</template>
