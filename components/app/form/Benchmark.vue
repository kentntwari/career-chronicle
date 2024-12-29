<script lang="ts" setup>
  import type { OrgPos, SingleOrg } from "~/types";

  import { ChevronDown as LucideChevronDownIcon } from "lucide-vue-next";

  import { newProject, newTimelineMarker } from "~/utils/zschemas";
  import * as benchmarks from "~/constants/benchmarks";
  import months from "~/constants/months";

  const props = defineProps<{
    parentOrganization: SingleOrg["slug"];
    parentPosition: OrgPos[number]["slug"];
    benchmark: (typeof benchmarks)[keyof typeof benchmarks];
  }>();

  const emit = defineEmits<{
    cancel: [void];
    formSubmitted: [void];
  }>();

  // TODO: Must handle hidden errors like missing slug
  const { handleSubmit, defineField, errors, isSubmitting } = useForm({
    validationSchema: toTypedSchema(
      props.benchmark === "PROJECTS" ? newProject : newTimelineMarker
    ),
  });

  const [title, titleAtts] = defineField("title");
  const [month, monthAttrs] = defineField("timeline.month");
  const [year, yearAttrs] = defineField("timeline.year");
  const [desc, descAttrs] = defineField("description");

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
      title: values.title.toLowerCase(),
      slug: generateSlug(values.title.toLowerCase()),
      description: values.description?.toLowerCase(),
    };

    emit("formSubmitted");

    $fetch(
      "/api/organization/" +
        props.parentOrganization +
        "/position/" +
        props.parentPosition +
        "/" +
        props.benchmark.toLocaleLowerCase(),
      {
        method: "POST",
        body: payload,
      }
    );
  });

  const dynamicTitle = computed(() => {
    return {
      form: `New ${props.benchmark.toLocaleLowerCase()}`,
      timeline:
        props.benchmark === "PROJECTS"
          ? "When do you plan to get it done?"
          : "When did this happen?",
    };
  });
</script>

<template>
  <form class="flex flex-col font-regular" @submit="onSubmit">
    <span class="block mb-4 font-medium">{{ dynamicTitle.form }}</span>
    <div class="space-y-1">
      <label
        :htmlFor="benchmark.toLocaleLowerCase()"
        class="text-sm text-neutral-grey-1100"
        >Write at most 150 characters a fitting title</label
      >
      <div class="min-h-[66px] space-y-[5px]">
        <ui-input
          :id="benchmark.toLocaleLowerCase()"
          type="text"
          v-model="title"
          v-bind="titleAtts"
        />
        <small class="text-xs text-danger-700">{{ errors.title }}</small>
      </div>
    </div>

    <fieldset class="space-y-[5px]">
      <span class="text-sm text-neutral-grey-1100"
        >{{ dynamicTitle.timeline }}
      </span>
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
          <ui-input id="year" type="number" v-model="year" v-bind="yearAttrs" />
          <small class="text-xs text-danger-700">{{
            errors["timeline.year"]
          }}</small>
        </div>
      </div>
    </fieldset>

    <div class="space-y-[5px]">
      <label htmlFor="description" class="text-sm text-neutral-grey-1100"
        >Summarize in less than 1000 words what it is about</label
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
