<script lang="ts" setup>
  import type {
    Orgs,
    OrgPos,
    SingleOrg,
    SinglePos,
    Benchmark,
    Benchmarks,
  } from "~/types";

  import { deleteSchema } from "~/utils/zschemas";
  import * as benchmarks from "~/constants/benchmarks";
  import { resolveAllPosBenchmarks } from "~/utils/keys";

  const props = defineProps<{
    target: "ORGANIZATION" | "POSITION" | "ACCOUNT" | Benchmark;
    data: string;
    parentOrg?: SingleOrg["slug"];
    parentPosition?: SinglePos["slug"];
  }>();

  const emit = defineEmits<{
    cancel: [void];
    "update:delete": [data: string];
  }>();

  const { handleSubmit, isSubmitting } = useForm({
    validationSchema: toTypedSchema(deleteSchema),
    initialValues: { slug: props.data },
  });

  const previousOrgs = ref<Orgs>([]);
  const previousPositions = ref<OrgPos>([]);
  const { data: currentOrgs } = useNuxtData<Orgs>("orgs");
  const { data: currentPositions } = useNuxtData<OrgPos>(
    resolveOrgPositions(props.parentOrg ?? "")
  );
  const { data: allBenchmarks } = useNuxtData<Benchmarks>(
    resolveAllPosBenchmarks(props.parentPosition ?? "", props.target)
  );

  const onSubmit = handleSubmit((values) => {
    emit("update:delete", values.slug);

    const BASE_URL = "/api/organization/";

    switch (props.target) {
      case "ACCOUNT":
        {
          if (props.data === "delete-account")
            $fetch("", {
              method: "DELETE",
              baseURL: "/api/user",
              async onResponse() {
                await navigateTo("/api/logout", {
                  external: true,
                });
              },
            });
        }

        break;

      case "ORGANIZATION":
        {
          $fetch(`/${values.slug}`, {
            method: "DELETE",
            baseURL: BASE_URL,
            onRequest: () => {
              if (currentOrgs.value) {
                previousOrgs.value = currentOrgs.value;
                currentOrgs.value = currentOrgs.value.filter(
                  (org) => org.slug !== values.slug
                );
              }
            },
            onRequestError: () => {
              currentOrgs.value = previousOrgs.value;
            },
            async onResponse() {
              await refreshNuxtData("orgs");
            },
          });
        }
        break;

      case "POSITION":
        {
          if (!props.parentOrg) return;

          const n = {
            ...values,
            parentOrg: props.parentOrg,
          };

          $fetch(`${n.parentOrg}/position/${n.slug}`, {
            method: "DELETE",
            baseURL: BASE_URL,
            onRequest: () => {
              if (currentPositions.value) {
                previousPositions.value = currentPositions.value;
                currentPositions.value = currentPositions.value.filter(
                  (pos) => pos.slug !== n.slug
                );
              }
            },
            onRequestError: () => {
              currentPositions.value = previousPositions.value;
            },
            async onResponse() {
              await refreshNuxtData(resolveOrgPositions(props.parentOrg!));
            },
          });
        }
        break;

      default:
        {
          if (!props.parentOrg) return;
          if (!props.parentPosition) return;

          const n = {
            ...values,
            parentOrg: props.parentOrg,
            parentPosition: props.parentPosition,
          };

          $fetch(
            `${n.parentOrg}/position/${n.parentPosition}/${props.target.toLocaleLowerCase()}`,
            {
              method: "DELETE",
              baseURL: BASE_URL,
              query: {
                data: n.slug,
              },
              async onResponse() {
                // Must do this to trigger revalidation
                // following logic of useCurrentPosition
                allBenchmarks.value = null;
              },
            }
          );
        }
        break;
    }
  });

  const currentTarget = computed(() => {
    if (props.target === "ORGANIZATION") return "organization";
    if (props.target === "POSITION") return "position";
    if (props.target === "ACCOUNT") return "account";
    if (props.target === benchmarks.ACHIEVEMENTS) return "achievement";
    if (props.target === benchmarks.CHALLENGES) return "challlenge";
    if (props.target === benchmarks.FAILURES) return "failure";
    if (props.target === benchmarks.PROJECTS) return "project";
  });
</script>

<template>
  <form @submit="onSubmit" class="h-full flex flex-col justify-between">
    <slot>
      <div class="space-y-2">
        <p class="font-medium text-neutral-grey-1300">Are you sure?</p>
        <small class="block font-regular text-sm text-neutral-grey-1000"
          >You will lose all data related to this {{ currentTarget }}
        </small>
      </div>
    </slot>

    <div class="w-full flex justify-end items-center gap-2">
      <ui-button
        variant="neutral"
        class="h-9"
        :disabled="isSubmitting"
        @click="emit('cancel')"
        >Cancel</ui-button
      >
      <ui-button
        type="submit"
        variant="destructive"
        class="h-9 min-w-20"
        :class="[isSubmitting ? 'isSubmitting' : '']"
        :disabled="isSubmitting"
        >Delete</ui-button
      >
    </div>
  </form>
</template>
