import { H3Event } from "h3";
import { z } from "zod";
import * as benchmark from "~/constants/benchmarks";
import {
  incomingNewOrgBody,
  incomingNewTimelineMarkerBody,
  incomingNewProjectBody,
  patchSchema,
  newOrg,
} from "~/utils/zschemas";

const METHOD = ["POST", "PUT", "PATCH"] as const;
const ORGANIZATION = "organization" as const;
const POSITION = "position" as const;

type Target =
  | typeof ORGANIZATION
  | typeof POSITION
  | (typeof benchmark)[keyof typeof benchmark];

export async function validateSubmission(
  event: H3Event,
  target: typeof ORGANIZATION
): Promise<z.infer<typeof incomingNewOrgBody>>;

export async function validateSubmission(
  event: H3Event,
  target: typeof POSITION
): Promise<z.infer<typeof incomingNewTimelineMarkerBody>>;

export async function validateSubmission(
  event: H3Event,
  target: (typeof benchmark)["PROJECTS"]
): Promise<z.infer<typeof incomingNewProjectBody>>;

export async function validateSubmission(
  event: H3Event,
  target: (typeof benchmark)[Exclude<
    (typeof benchmark)[keyof typeof benchmark],
    "PROJECTS"
  >]
): Promise<z.infer<typeof incomingNewTimelineMarkerBody>>;

export async function validateSubmission(
  event: H3Event,
  target:
    | typeof ORGANIZATION
    | typeof POSITION
    | (typeof benchmark)["PROJECTS"]
    | (typeof benchmark)[Exclude<
        (typeof benchmark)[keyof typeof benchmark],
        "PROJECTS"
      >],
  action: "PATCH"
): Promise<z.infer<typeof patchSchema>>;

export async function validateSubmission<T extends Target>(
  event: H3Event,
  target: T,
  action: (typeof METHOD)[number] = "POST"
) {
  if (
    target !== ORGANIZATION &&
    target !== POSITION &&
    !benchmark[target as keyof typeof benchmark]
  )
    throw createError({
      statusCode: 400,
      statusMessage: "Bad request",
    });

  const submitted = await readValidatedBody(event, (body) => {
    switch (true) {
      case target === ORGANIZATION:
        if (action === "PATCH") return patchSchema.safeParse(body);
        return incomingNewOrgBody.safeParse(body);

      case target === benchmark.PROJECTS:
        if (action === "PATCH") return patchSchema.safeParse(body);
        return incomingNewProjectBody.safeParse(body);

      default:
        if (action === "PATCH") return patchSchema.safeParse(body);
        return incomingNewTimelineMarkerBody.safeParse(body);
    }
  });

  if (!submitted)
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
      message: "No submission was made",
    });

  if (!submitted.success)
    throw createError({
      statusCode: 400,
      statusMessage: "Wrong submission",
      message: submitted.error.message,
    });

  return submitted.data;
}
