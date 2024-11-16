import { useCurrentRouteOrg } from "./useCurrentRouteOrg";

export function useOrganizationKey() {
  const currentOrg = useCurrentRouteOrg();
  const { $auth } = useNuxtApp();
  return toRef(() => "user:" + $auth.user?.email + ":org:" + currentOrg.value);
}

export function useOrgPositionsKey() {
  const currentOrg = useCurrentRouteOrg();
  const { $auth } = useNuxtApp();
  return toRef(
    () =>
      "user:" + $auth.user?.email + ":org:" + currentOrg.value + ":positions"
  );
}

export function useCurrentPositionKey() {
  const currentOrg = useCurrentRouteOrg();
  const currentPosition = useCurrentRoutePosition();
  const { $auth } = useNuxtApp();
  return toRef(
    () =>
      "user:" +
      $auth.user?.email +
      ":org:" +
      currentOrg.value +
      ":pos:" +
      currentPosition.value
  );
}
