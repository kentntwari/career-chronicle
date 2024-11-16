import type { H3Event } from "h3";

const ORGANIZATION = "organization" as const;
const POSITION = "position" as const;

type Target = typeof ORGANIZATION | typeof POSITION;

export function validateParams(
  event: H3Event,
  target: typeof ORGANIZATION
): string;
export function validateParams(event: H3Event, target: typeof POSITION): string;
export function validateParams<T extends Target>(event: H3Event, directory: T) {
  switch (true) {
    case directory === "organization":
      const organization = getRouterParam(event, "orgSlug");
      if (!organization)
        throw createError({
          statusCode: 400,
          statusMessage: "Bad request",
          message: "Organization not provided",
        });
      else return organization;

    case directory === "position":
      const position = getRouterParam(event, "positionSlug");
      if (!position)
        throw createError({
          statusCode: 400,
          statusMessage: "Bad request",
          message: "Position not provided",
        });
      else return position;

    default:
      throw createError({
        statusCode: 400,
        statusMessage: "Bad request",
      });
  }
}
