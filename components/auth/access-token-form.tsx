import { AccessTokenClient } from "@/components/auth/access-token-client";

export function AccessTokenForm({
  inviteStatus
}: {
  inviteStatus?: "ready" | "invalid" | "missing" | "rate_limited";
}) {
  return <AccessTokenClient inviteStatus={inviteStatus} />;
}
