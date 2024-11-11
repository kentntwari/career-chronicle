import { H3Event } from "h3";
import { z } from "zod";
import * as zschemas from "~/utils/zschemas";

const ORGANIZATION = "organization" as const;
const POSITION = "position" as const;

type Target = typeof ORGANIZATION | typeof POSITION;

export async function validateSubmission(
  event: H3Event,
  target: typeof ORGANIZATION
): Promise<z.infer<typeof zschemas.incomingNewOrgBody>>;

export async function validateSubmission(
  event: H3Event,
  target: typeof POSITION
): Promise<z.infer<typeof zschemas.incomingNewOrgBody>>;

export async function validateSubmission<T extends Target>(
  event: H3Event,
  target: T
) {
  if (target !== "organization" && target !== "position")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad request",
    });

  const submitted = await readValidatedBody(event, (body) => {
    switch (true) {
      case target === "organization":
        return zschemas.incomingNewOrgBody.safeParse(body);

      default:
        return zschemas.incomingNewPositionBody.safeParse(body);
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
    });

  return submitted.data;
}
