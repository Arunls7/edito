/** True quand les clés Clerk semblent réelles (pas les placeholders du `.env.example`). */
export function hasClerkPublishableConfig(): boolean {
  const k = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return Boolean(
    k &&
      (k.startsWith("pk_test_") || k.startsWith("pk_live_")) &&
      !k.includes("xxx"),
  );
}
