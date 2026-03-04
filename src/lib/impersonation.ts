/**
 * In-memory impersonation state.
 * Maps adminUserId → impersonatedUserId.
 * Checked in the JWT callback on every request.
 */

const impersonationStore = new Map<string, string>();

export function startImpersonation(adminId: string, targetId: string) {
  impersonationStore.set(adminId, targetId);
}

export function stopImpersonation(adminId: string) {
  impersonationStore.delete(adminId);
}

export function getImpersonation(adminId: string): string | undefined {
  return impersonationStore.get(adminId);
}
