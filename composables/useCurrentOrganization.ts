import type { Benchmark, SingleOrg } from "~/types";

import * as benchmarks from "~/constants/benchmarks";
import { DEFAULT_ORGANIZATION_OBJ } from "~/constants/defaults";

interface OrganizationResponse extends SingleOrg {
  hasCreatedBenchmark: boolean;
}

interface UseCurrentOrganization {
  organization: ComputedRef<OrganizationResponse>;
  updateOrgPositionState: () => void;
  updateOrgBenchmarkState: (benchmark: Benchmark) => void;
}

export function useCurrentOrganization(): UseCurrentOrganization {
  const route = useRoute();

  const k = useOrganizationKey();
  const organization = useState<SingleOrg>(k.value, () => ({
    ...DEFAULT_ORGANIZATION_OBJ,
  }));

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
  // FIX: find way to initiate the fetch on the server to prevent flicker
  watchEffect(async () => {
    if (organization.value.name === "")
      organization.value = await useRequestFetch()<SingleOrg>(
        `${route.params.orgSlug}`,
        {
          baseURL: "/api/organization",
        }
      );
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
  };
}
