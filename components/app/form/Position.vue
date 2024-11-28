<script lang="ts" setup>
  import type { SingleOrg, OrgPos } from "~/types";
  import type { Month } from "@prisma/client";

  import { z } from "zod";
  import { ChevronDown as LucideChevronDownIcon } from "lucide-vue-next";

  import months from "~/months";

  const props = defineProps<{
    parentOrganization: SingleOrg["slug"];
  }>();

  const emit = defineEmits<{
    cancel: [void];
    formSubmitted: [void];
  }>();

  // TODO: Must handle hidden errors like missing slug
  const { handleSubmit, defineField, errors, isSubmitting } = useForm({
    validationSchema: toTypedSchema(newTimelineMarker),
  });

  const orgPosKey = useOrgPositionsKey();
  const { data: currentPositions } = useNuxtData<OrgPos>(orgPosKey.value);

  const previousPositions = ref<OrgPos>([]);

  const [title, titleAtts] = defineField("title");
  const [month, monthAttrs] = defineField("timeline.month");
  const [year, yearAttrs] = defineField("timeline.year");
  const [desc, descAttrs] = defineField("description");

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
      title: values.title.toLocaleLowerCase(),
      slug: generateSlug(values.title.toLowerCase()),
      description: values.description?.toLocaleLowerCase(),
    } satisfies z.infer<typeof incomingNewTimelineMarkerBody>;

    emit("formSubmitted");

    $fetch("/api/organization/" + props.parentOrganization + "/position", {
      method: "POST",
      body: payload,
      onRequest() {
        const altered = {
          title: payload.title.toLocaleLowerCase(),
          slug: generateSlug(payload.title.toLowerCase()),
          monthStartedAt: payload.timeline.month as Month,
          yearStartedAt: payload.timeline.year,
        };
        if (currentPositions.value !== null) {
          previousPositions.value = currentPositions.value;
          currentPositions.value.push(altered);
        } else {
          currentPositions.value = [];
          currentPositions.value.push(altered);
        }
      },
      onRequestError() {
        currentPositions.value = previousPositions.value; // Rollback the data if the request failed.
      },
      async onResponse() {
        await refreshNuxtData(orgPosKey.value); // Invalidate orgs in the background if the request succeeded.
      },
    });
  });
</script>

<template>
  <form class="flex flex-col font-regular" @submit="onSubmit">
    <span class="block mb-4 font-medium">New position</span>
    <div class="space-y-1">
      <label htmlFor="position" class="text-sm text-neutral-grey-1100"
        >What is/was your position?</label
      >
      <div class="min-h-[66px] space-y-[5px]">
        <ui-input
          id="position"
          type="text"
          v-model="title"
          v-bind="titleAtts"
          placeholder="e.g. Software Engineer"
        />
        <small class="text-xs text-danger-700">{{ errors.title }}</small>
      </div>
    </div>

    <fieldset class="space-y-[5px]">
      <span class="text-sm text-neutral-grey-1100">When did you start?</span>
      <div class="flex items-center gap-x-1">
        <div class="min-h-[66px] space-y-[5px]">
          <select-root :default-value="''" v-model="month" v-bind="monthAttrs">
            <select-trigger
              class="inline-flex min-w-[160px] h-10 flex-1 items-center justify-between rounded px-[15px] text-sm leading-none gap-[5px] border border-neutral-grey-700 data-[placeholder]:text-neutral-grey-700 outline-none"
              placeholder="e.g:September"
              aria-label="Select month"
            >
              <select-value
                placeholder="Select month"
                class="text-neutral-grey-1300"
              />
              <lucide-chevron-down-icon />
            </select-trigger>

            <select-portal>
              <select-content
                class="min-w-[160px] bg-[#fff] rounded shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.20),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] z-[100]"
              >
                <select-scroll-up-button
                  class="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default"
                >
                  <Icon icon="radix-icons:chevron-up" />
                </select-scroll-up-button>

                <select-viewport class="p-[5px]">
                  <select-group>
                    <select-item
                      v-for="(month, index) in months"
                      :key="month"
                      class="text-xs text-neutral-grey-1000 leading-none flex items-center h-8 relative select-none data-[disabled]:text-neutral-grey-700 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-success-400 data-[highlighted]:text-neutral-grey-1100"
                      :value="month"
                    >
                      <select-item-text>
                        {{ month }}
                      </select-item-text>
                    </select-item>
                  </select-group>
                </select-viewport>

                <select-scroll-down-button
                  class="flex items-center justify-center h-[25px] bg-white cursor-default"
                >
                  <lucide-chevron-down-icon />
                </select-scroll-down-button>
              </select-content>
            </select-portal>
          </select-root>
          <small class="block text-xs text-danger-700">{{
            errors["timeline.month"]
          }}</small>
        </div>
        <div class="min-h-[66px] space-y-[5px]">
          <ui-input
            id="year"
            type="number"
            v-model="year"
            v-bind="yearAttrs"
            placeholder="e.g. 2016"
            class="min-w-[150px]"
          />
          <small class="text-xs text-danger-700">{{
            errors["timeline.year"]
          }}</small>
        </div>
      </div>
    </fieldset>

    <div class="space-y-[5px]">
      <label htmlFor="description" class="text-sm text-neutral-grey-1100"
        >Describe in less than 500 words what your position is/was about</label
      >
      <ui-textarea
        id="description"
        v-model="desc"
        v-bind="descAttrs"
        class="min-h-[140px] text-balance text-start"
      />
      <small class="text-xs text-danger-700">{{ errors.description }}</small>
    </div>

    <div class="mt-4 mb-2 w-full flex justify-end items-center gap-2">
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
