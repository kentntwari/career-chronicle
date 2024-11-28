import * as benchmarks from "~/constants/benchmarks";

export function useOrganizationKey() {
  const route = useRoute();
  return computed(() => "org:" + route.params.orgSlug);
}

export function useOrgPositionsKey() {
  const route = useRoute();
  return computed(() => "org:" + route.params.orgSlug + ":positions");
}

export function useCurrentPositionKey() {
  const route = useRoute();
  return computed(() => "pos:" + route.params.positionSlug);
}

export function usePositionAchievementsKey() {
  const route = useRoute();
  return computed(
    () =>
      "pos:" +
      route.params.positionSlug +
      `:${benchmarks.ACHIEVEMENTS.toLocaleLowerCase()}`
  );
}

export function usePositionChallengesKey() {
  const route = useRoute();
  return computed(
    () =>
      "pos:" +
      route.params.positionSlug +
      `:${benchmarks.CHALLENGES.toLocaleLowerCase()}`
  );
}

export function usePositionProjectsKey() {
  const route = useRoute();
  return computed(
    () =>
      "pos:" +
      route.params.positionSlug +
      `:${benchmarks.PROJECTS.toLocaleLowerCase()}`
  );
}

export function usePositionFailuresKey() {
  const route = useRoute();
  return computed(
    () =>
      "pos:" +
      route.params.positionSlug +
      `:${benchmarks.FAILURES.toLocaleLowerCase()}`
  );
}

export function useQueriedBenchmarkKey() {
  const route = useRoute();
  return computed(
    () =>
      "pos:" +
      route.params.positionSlug +
      ":" +
      (route.query.benchmark ?? benchmarks.ACHIEVEMENTS)
  );
}
