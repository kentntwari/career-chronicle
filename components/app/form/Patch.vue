<script lang="ts" setup>
  import type { Month } from "@prisma/client";
  import type {
    SingleOrg,
    SinglePos,
    Benchmark,
    BenchmarkState,
  } from "~/types";

  import { z } from "zod";

  import months from "~/constants/months";
  import * as benchmarks from "~/constants/benchmarks";
  import * as intents from "~/constants/intents";
  import { resolveProvidedKeys } from "~/utils/keys";
  import {
    ALL_ORGANIZATIONS,
    CURRENT_BENCHMARK,
    CURRENT_ORGANIZATION,
  } from "~/constants/routeNames";

  const props = defineProps<{
    target: "ORGANIZATION" | "POSITION" | Benchmark;
    intent: (typeof intents)[keyof typeof intents];
    data: Omit<z.infer<typeof patchSchema>, "slug"> & {
      patchedSlug: string;
    };
    parentOrg?: SingleOrg["slug"];
    parentPosition?: SinglePos["slug"];
  }>();

  const emit = defineEmits<{
    cancel: [void];
    "update:patch": [
      patchedData: string | Pick<SinglePos, "monthStartedAt" | "yearStartedAt">,
      patchedSlug: string,
    ];
  }>();

  const route = useRoute();

  type Injected = { update: () => void } | BenchmarkState | undefined;
  let injected: Injected;
  if (route.name === ALL_ORGANIZATIONS)
    injected = inject<{ update: () => void }>(
      resolveProvidedKeys().organizations.state
    );
  if (route.name === CURRENT_ORGANIZATION)
    injected = inject<{ update: () => Promise<void> }>(
      resolveProvidedKeys().positions.state
    );
  if (route.name === CURRENT_BENCHMARK)
    injected = inject<BenchmarkState>(resolveProvidedKeys().benchmarks.state);

  const { defineField, handleSubmit, isSubmitting, errors } = useForm({
    validationSchema: toTypedSchema(patchSchema),
    initialValues: {
      slug: { current: props.data.patchedSlug, new: props.data.patchedSlug },
      org:
        props.target === "ORGANIZATION"
          ? { name: props.data.org?.name }
          : undefined,
      position:
        props.target === "POSITION" ? { ...props.data.position } : undefined,
      benchmark: {
        title: props.data.benchmark?.title,
        description: props.data.benchmark?.description,
      },
    },
  });

  const [org, orgAttrs] = defineField("org.name");
  const [positionTitle, positionTitleAttrs] = defineField("position.title");
  const [positionDesc, positionDescAttrs] = defineField("position.description");
  const [positionTimelineMonth, positionTimelineMonthAttrs] = defineField(
    "position.timeline.month"
  );
  const [positionTimelineYear, positionTimelineYearAttrs] = defineField(
    "position.timeline.year"
  );
  const [benchmarkTitle, benchmarkTitleAttrs] = defineField("benchmark.title");
  const [benchmarkDescription, benchmarkDescriptionAttrs] = defineField(
    "benchmark.description"
  );

  const formTitle = computed(() => {
    if (props.intent === intents.EDIT_NAME) return "Edit Name";
    if (props.intent === intents.EDIT_TITLE) return "Edit Title";
    if (props.intent === intents.EDIT_DESCRIPTION) return "Edit Description";
    if (props.intent === intents.EDIT_TIMELINE) return "Edit Timeline";
  });

  const isPatchOrganization = computed(() => props.target === "ORGANIZATION");
  const isPatchPosition = computed(() => props.target === "POSITION");
  const isPatchBenchmark = computed(() => {
    for (const b of Object.values(benchmarks)) {
      if (b === props.target) return true;
      return false;
    }
  });

  const onSubmit = handleSubmit((values) => {
    switch (true) {
      case isPatchOrganization.value:
        if (!values.org) return;
        if (!values.org.name) return;
        if (props.intent === intents.EDIT_NAME) {
          const payload = {
            ...values,
            slug: { ...values.slug, new: generateSlug(values.org.name) },
          } satisfies typeof values;
          patchOrganizationFetch(payload);
        }
        break;

      case isPatchPosition.value:
        if (!values.position) return;
        if (props.intent === intents.EDIT_TITLE && !!values.position.title) {
          const payload = {
            position: { title: values.position.title },
            slug: { ...values.slug, new: generateSlug(values.position.title) },
          } satisfies typeof values;
          patchPositionFetch(payload);
          emit("update:patch", payload.position.title, values.slug.new);
        }
        if (
          props.intent === intents.EDIT_DESCRIPTION &&
          !!values.position.description
        ) {
          const payload = {
            slug: { ...values.slug },
            position: { description: values.position.description },
          } satisfies typeof values;
          patchPositionFetch(payload);
          emit(
            "update:patch",
            payload.position.description,
            payload.slug.current
          );
        }
        if (
          props.intent === intents.EDIT_TIMELINE &&
          !!values.position.timeline
        ) {
          const payload = {
            slug: { ...values.slug },
            position: {
              timeline: {
                month: values.position.timeline.month as Month,
                year: values.position.timeline.year,
              },
            },
          } satisfies typeof values;
          patchPositionFetch(payload);
          emit(
            "update:patch",
            {
              monthStartedAt: payload.position.timeline.month as Month,
              yearStartedAt: payload.position.timeline.year!,
            },
            values.slug.current
          );
        }
        break;

      case isPatchBenchmark.value:
        if (!values.benchmark?.title) return;
        if (props.intent === intents.EDIT_TITLE) {
          const payload = {
            benchmark: { title: values.benchmark.title },
            slug: { ...values.slug, new: generateSlug(values.benchmark.title) },
          } satisfies typeof values;
          patchBenchmarkFetch(payload);
          emit("update:patch", payload.benchmark.title, payload.slug.new);
        }
        break;

      default:
        break;
    }
  });

  function patchOrganizationFetch(body: z.infer<typeof patchSchema>) {
    $fetch(props.data.patchedSlug, {
      method: "PATCH",
      baseURL: "/api/organization",
      body,
      onResponse: () => {
        if (injected) injected.update();
      },
    });
  }

  function patchPositionFetch(body: z.infer<typeof patchSchema>) {
    if (!props.parentOrg) return;
    $fetch(`${props.parentOrg}/position/${props.data.patchedSlug}`, {
      baseURL: "/api/organization",
      method: "PATCH",
      body,
      onResponse: () => {
        if (injected) injected.update();
      },
    });
  }

  function patchBenchmarkFetch(body: z.infer<typeof patchSchema>) {
    if (!props.parentOrg) return;
    if (!props.parentPosition) return;
    if (!isPatchBenchmark.value) return;

    const BASE_URL = `/api/organization/${props.parentOrg}/position/${props.parentPosition}`;

    $fetch(props.target.toLocaleLowerCase(), {
      method: "PATCH",
      baseURL: BASE_URL,
      body,
      onResponse: () => {
        if (injected) injected.update();
      },
    });
  }
</script>

<template>
  <div class="space-y-4">
    <span class="block font-medium text-base">{{ formTitle }}</span>

    <form @submit="onSubmit" class="space-y-4">
      <ui-input
        v-model="org"
        v-bind="orgAttrs"
        v-show="intent === intents.EDIT_NAME && isPatchOrganization"
      />
      <ui-input
        v-model="positionTitle"
        v-bind="positionTitleAttrs"
        v-show="intent === intents.EDIT_TITLE && isPatchPosition"
      />
      <ui-textarea
        v-model:model-value="positionDesc"
        v-bind="positionDescAttrs"
        v-show="intent === intents.EDIT_DESCRIPTION && isPatchPosition"
      />
      <ui-textarea
        v-model:model-value="benchmarkTitle"
        v-bind="benchmarkTitleAttrs"
        v-show="intent === intents.EDIT_TITLE && isPatchBenchmark"
        class="h-24"
      />
      <ui-textarea
        v-model:model-value="benchmarkDescription"
        v-bind="benchmarkDescriptionAttrs"
        v-show="intent === intents.EDIT_DESCRIPTION && isPatchBenchmark"
        class="h-32"
      />
      <div
        class="flex items-center gap-1"
        v-show="intent === intents.EDIT_TIMELINE && isPatchPosition"
      >
        <ui-select
          :default="positionTimelineMonth"
          v-model:selected="positionTimelineMonth"
          v-bind="positionTimelineMonthAttrs"
          :items="months"
        />
        <ui-input
          id="year"
          type="number"
          v-model="positionTimelineYear"
          v-bind="positionTimelineYearAttrs"
          placeholder="e.g. 2016"
        />
      </div>
      <small
        class="text-xs text-danger-700"
        v-show="intent === intents.EDIT_NAME && isPatchOrganization"
        >{{ errors["org.name"] }}</small
      >
      <small
        class="text-xs text-danger-700"
        v-show="intent === intents.EDIT_DESCRIPTION && isPatchPosition"
        >{{ errors["position.description"] }}</small
      >
      <small
        class="text-xs text-danger-700"
        v-show="intent === intents.EDIT_TIMELINE && isPatchPosition"
        >{{ errors["position.timeline.month"] }}<br />{{
          errors["position.timeline.year"]
        }}</small
      >
      <small
        class="text-xs text-danger-700"
        v-show="intent === intents.EDIT_TITLE && isPatchBenchmark"
        >{{ errors["benchmark.title"] }}</small
      >
      <small
        class="text-xs text-danger-700"
        v-show="intent === intents.EDIT_DESCRIPTION && isPatchBenchmark"
        >{{ errors["benchmark.description"] }}</small
      >
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
  </div>
</template>
