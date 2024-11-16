export function useCurrentRoutePosition() {
  const route = useRoute();

  const currentPosition = useState<string>("current-position");

  watchEffect(() => {
    currentPosition.value =
      typeof route.params.positionSlug === "string"
        ? route.params.positionSlug
        : route.params.positionSlug?.join("/");
  });

  return currentPosition;
}
