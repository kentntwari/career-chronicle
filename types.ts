import type {
  Organization,
  Position,
  Achievement,
  Failure,
  Project,
  Challenge,
  OrganizationStates,
} from "@prisma/client";
import type {
  ACClient,
  SessionManager,
  UserType,
} from "@kinde-oss/kinde-typescript-sdk";

import * as b from "~/utils/button";
import * as benchmarks from "~/constants/benchmarks";
import type { loadPosition, loadPositionBenchmarks } from "./server/utils/db";

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

export type KindeAccessToken = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

export type Orgs = Pick<Organization, "name" | "slug">[];
export type SingleOrg = NonNullable<Awaited<ReturnType<typeof loadOrg>>>;
export type SinglePos = NonNullable<Awaited<ReturnType<typeof loadPosition>>>;
export type Benchmarks = NonNullable<
  Awaited<ReturnType<typeof loadPositionBenchmarks>>
>;

export type ApiFetchedOrgs = Orgs[number] | null | undefined;
export type OrgPos = Pick<
  Position,
  "title" | "slug" | "monthStartedAt" | "yearStartedAt"
>[];
export type OrgStates = Omit<OrganizationStates, "id">;

export interface ButtonVariants {
  variant?: NonNullable<Parameters<typeof b.variants>[0]>["variant"];
  size?: NonNullable<Parameters<typeof b.variants>[0]>["size"];
}

export type Benchmark = (typeof benchmarks)[keyof typeof benchmarks];
export type BenchmarkPayload =
  | Omit<Achievement | Failure, "id" | "positionId">
  | Omit<Project, "id" | "positionId">
  | Omit<Challenge, "id" | "positionId">;
export type BenchmarkState = {
  shouldRefresh: Ref<boolean>;
  update: () => void;
};
export type ProvidedBenchmarks = {
  data: Ref<Benchmarks>;
  getResourceIndex: (slug: string) => number | undefined;
  deleteBenchmark: (slug: string) => void;
};
