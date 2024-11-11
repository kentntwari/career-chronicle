import type {
  Prisma,
  Organization,
  Position,
  OrganizationStates,
} from "@prisma/client";
import type {
  ACClient,
  SessionManager,
  UserType,
} from "@kinde-oss/kinde-typescript-sdk";

import { z } from "zod";

import * as zschemas from "@/utils/zschemas";

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
export type ApiFetchedOrgs = Orgs[number] | null | undefined;
export type OrgPos = Pick<Position, "title" | "slug">[];
export type OrgStates = Omit<OrganizationStates, "id">;
