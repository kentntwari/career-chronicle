import { ref, watch, type Ref } from "vue";
import type { AsyncDataRequestStatus } from "nuxt/app";

type DebouncedLoadingOptions = {
  minLoadingTime?: number;
};

type DebouncedLoadingReturn = {
  isLoading: Ref<AsyncDataRequestStatus>;
};

export function useDebouncedLoading(
  sourceLoadingState: Ref<AsyncDataRequestStatus>,
  options: DebouncedLoadingOptions = {}
): DebouncedLoadingReturn {
  const { minLoadingTime = 200 } = options;
  const debouncedLoading = ref<AsyncDataRequestStatus>("idle");
  let loadingStartTime: number | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  watch(sourceLoadingState, (newState) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (newState === "pending") {
      loadingStartTime = Date.now();
      debouncedLoading.value = newState;
    } else {
      const loadingDuration = loadingStartTime
        ? Date.now() - loadingStartTime
        : 0;

      if (loadingDuration < minLoadingTime) {
        const remainingTime = minLoadingTime - loadingDuration;
        timeoutId = setTimeout(() => {
          debouncedLoading.value = newState;
          loadingStartTime = null;
        }, remainingTime);
      } else {
        debouncedLoading.value = newState;
        loadingStartTime = null;
      }
    }
  });

  return {
    isLoading: debouncedLoading,
  };
}
