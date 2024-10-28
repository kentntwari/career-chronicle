export type Permissions = [
  "read:orgs",
  "update:orgs",
  "read:position",
  "update:position",
  "read:benchmark",
  "update:benchmark",
];

export function hasPermissions(
  permissions: Permissions,
  type: Permissions[number]
) {
  if (!permissions.includes(type)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Not allowed",
    });
  }
}
