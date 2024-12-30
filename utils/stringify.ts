import type { RouteParamsGeneric, LocationQueryValue } from "vue-router";
export function stringifyRoute(
  r:
    | RouteParamsGeneric[keyof RouteParamsGeneric]
    | LocationQueryValue
    | LocationQueryValue[]
) {
  if (typeof r === "string") return r;
  else if (!r) return "";
  return r.join("/");
}
