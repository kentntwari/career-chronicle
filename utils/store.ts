export function resolveUser(email: string) {
  return `user:${email}:first-time`;
}

export function resolveUserOrgs(email: string) {
  return `user:${email}:orgs`;
}

export function resolveUserPlan(email: string) {
  return `user:${email}:plan`;
}
