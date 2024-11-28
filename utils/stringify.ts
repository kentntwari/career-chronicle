import type { RouteParamsGeneric } from "vue-router";
export function stringifyRoute(
  r: RouteParamsGeneric[keyof RouteParamsGeneric]
) {
  if (typeof r === "string") return r;
  return r.join("/");
}
