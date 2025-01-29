import type { Benchmark, SingleOrg } from "~/types";

import { H3Error } from "h3";
import { FetchError } from "ofetch";

import * as benchmarks from "~/constants/benchmarks";
import { DEFAULT_ORGANIZATION_OBJ } from "~/constants/defaults";

interface OrganizationResponse extends SingleOrg {
  hasCreatedBenchmark: boolean;
}

interface UseCurrentOrganization {
  organization: ComputedRef<OrganizationResponse>;
  updateOrgPositionState: () => void;
  updateOrgBenchmarkState: (benchmark: Benchmark) => void;
  error: Ref<boolean> | null;
}

export function useCurrentOrganization(): UseCurrentOrganization {
  const route = useRoute();

  const k = resolveOrgPositions(stringifyRoute(route.params.orgSlug));
  const organization = useState<SingleOrg>(k, () => ({
    ...DEFAULT_ORGANIZATION_OBJ,
  }));

  const notFoundError = ref(false);

  const computedOrganization = computed<OrganizationResponse>(() => {
    if (
      organization.value.hasCreatedAchievementBefore ||
      organization.value.hasCreatedChallengeBefore ||
      organization.value.hasCreatedFailureBefore ||
      organization.value.hasCreatedProjectBefore
    )
      return { ...organization.value, hasCreatedBenchmark: true };

    return { ...organization.value, hasCreatedBenchmark: false };
  });
  // FIX: initiate the fetch on the server to prevent flicker
  watchEffect(async () => {
    try {
      if (organization.value.name === "")
        organization.value = await useRequestFetch()<SingleOrg>(
          `${route.params.orgSlug}`,
          {
            baseURL: "/api/organization",
          }
        );
    } catch (error) {
      // TODO: handle multiple error states/codes
      if (error instanceof FetchError && error.statusCode === 404)
        notFoundError.value = true;
      else
        throw createError({
          statusCode: 500,
          fatal: true,
        });
    }
  });

  function updateOrgPositionState() {
    if (!organization.value.hasCreatedPositionBefore)
      organization.value.hasCreatedPositionBefore = true;
  }

  function updateOrgBenchmarkState(b: Benchmark) {
    if (!organization.value) return;
    if (b === benchmarks.PROJECTS)
      organization.value.hasCreatedProjectBefore = true;
    else if (b === benchmarks.ACHIEVEMENTS)
      organization.value.hasCreatedAchievementBefore = true;
    else if (b === benchmarks.CHALLENGES)
      organization.value.hasCreatedChallengeBefore = true;
    else if (b === benchmarks.FAILURES)
      organization.value.hasCreatedFailureBefore = true;
  }

  return {
    organization: computedOrganization,
    updateOrgPositionState,
    updateOrgBenchmarkState,
    error: notFoundError,
  };
}
