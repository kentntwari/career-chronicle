export function useCurrentRouteOrg() {
  const route = useRoute();

  const currentOrg = useState<string>("current-org");

  watchEffect(() => {
    currentOrg.value =
      typeof route.params.orgSlug === "string"
        ? route.params.orgSlug
        : route.params.orgSlug?.join("/");
  });

  return currentOrg;
}
