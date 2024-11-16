import type {
  Organization,
  Position,
  OrganizationStates,
} from "@prisma/client";
import type {
  ACClient,
  SessionManager,
  UserType,
} from "@kinde-oss/kinde-typescript-sdk";

import * as b from "~/utils/button";
import type { loadPosition } from "./server/utils/db";

export type AuthState =
  | { loggedIn: true; user: UserType }
  | { loggedIn: false; user: null };

type Slice<T extends Array<unknown>> = T extends [infer _A, ...infer B]
  ? B
  : never;

export type KindeContext = {
  [key in keyof ACClient]: (
    ...args: Slice<Parameters<ACClient[key]>>
  ) => ReturnType<ACClient[key]>;
} & { sessionManager: SessionManager };

export type Orgs = Pick<Organization, "name" | "slug">[];
export type SingleOrg = NonNullable<Awaited<ReturnType<typeof loadOrg>>>;
export type SinglePos = NonNullable<Awaited<ReturnType<typeof loadPosition>>>;
export type ApiFetchedOrgs = Orgs[number] | null | undefined;
export type OrgPos = Pick<Position, "title" | "slug">[];
export type OrgStates = Omit<OrganizationStates, "id">;
export type CachedPosition = Omit<
  Position,
  "id" | "createdAt" | "updatedAt" | "organizationId"
>;

export interface ButtonVariants {
  variant?: NonNullable<Parameters<typeof b.variants>[0]>["variant"];
  size?: NonNullable<Parameters<typeof b.variants>[0]>["size"];
}
