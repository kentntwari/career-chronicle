import type { Prisma } from "@prisma/client";
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

export type Orgs = z.infer<typeof zschemas.cachedOrgs>;
export type ApiFetchedOrgs = z.infer<typeof zschemas.apiFetchedOrgs>;
export type UserPlan = z.infer<typeof zschemas.userPlan>;
