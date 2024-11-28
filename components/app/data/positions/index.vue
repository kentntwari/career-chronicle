<script lang="ts" setup>
  import type { SingleOrg } from "~/types";
  import type { OrgPos } from "~/types";

  import months from "~/constants/months";

  interface Props {
    data: OrgPos;
    parentOrganization: SingleOrg["slug"];
  }

  const props = defineProps<Props>();

  const route = useRoute();
  const router = useRouter();

  const createdPositions = computed(() => {
    return !props.data ? 0 : props.data.length;
  });

  const accYears = computed(() => {
    const years = props.data.map(({ yearStartedAt: year }) => year.toString());
    return [...new Set(years)];
  });
</script>

<template>
  <section
    class="min-h-9 h-fit border-b border-neutral-grey-600"
    :class="[route.query.organize ? 'pb-6' : '']"
  >
    <h1 class="font-bold text-md">
      Positions
      <span class="inherit" v-show="!route.query.organize">
        ({{ createdPositions }})
      </span>
      <span class="inherit" v-show="route.query.organize"
        >held in
        <div class="inline-flex gap-3">
          <ui-select
            :key="route.fullPath"
            :default="route.query.month ? route.query.month.toString() : ''"
            :items="months"
            :classes="{
              trigger: 'bg-[#fff] font-medium text-sm',
            }"
            :placeholder="'Select month'"
            @update:selected="
              (month) =>
                router.push({
                  query: {
                    ...route.query,
                    month,
                  },
                })
            "
          />
          <ui-select
            :key="route.fullPath"
            :default="route.query.year ? route.query.year.toString() : ''"
            :items="accYears"
            :classes="{
              trigger: 'bg-[#fff] font-medium text-sm',
            }"
            :placeholder="'Select year'"
            @update:selected="
              (year) =>
                router.push({
                  query: {
                    ...route.query,
                    year,
                  },
                })
            "
          />
        </div>
      </span>
    </h1>
  </section>
  <div class="mt-6 space-y-8">
    <div class="min-h-40 flex flex-col gap-4">
      <template v-if="!route.query.organize">
        <app-data-position-snippet
          v-for="position in data"
          :data="position"
          :key="position.slug"
          :parent-organization="parentOrganization"
        />
      </template>

      <app-data-positions-organized :initial="data" v-else>
        <template #default="{ organizedData }">
          <app-data-position-snippet
            v-for="position in organizedData"
            :data="position"
            :key="position.slug"
            :parent-organization="parentOrganization"
          />
        </template>
      </app-data-positions-organized>
    </div>

    <div class="flex flex-col-reverse items-start gap-y-6">
      <ui-button
        :variant="'link'"
        :size="'link'"
        @click="
          !route.query.organize
            ? router.push({
                query: {
                  organize: 'true',
                },
              })
            : router.push({
                query: {},
              })
        "
        >{{ !route.query.organize ? "Organize" : "Unorganize" }} by year and
        month</ui-button
      >
      <ui-dialog>
        <template #trigger="{ open: createPosition }">
          <app-create-position-btn
            :data="data ?? []"
            :variant="'link'"
            :size="'link'"
            @create="createPosition()"
          >
            Add position
          </app-create-position-btn>
        </template>
        <template v-slot="{ close }" #default>
          <visually-hidden>
            <dialog-title></dialog-title>
          </visually-hidden>
          <visually-hidden
            ><dialog-description></dialog-description
          ></visually-hidden>
          <app-form-position
            :parent-organization="parentOrganization"
            @cancel="close()"
            @form-submitted="close()"
          />
        </template>
      </ui-dialog>
    </div>
  </div>
</template>
