/** True quand les clés Clerk semblent réelles (pas les placeholders du `.env.example`). */
export function hasClerkPublishableConfig(): boolean {
  const k = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return Boolean(
    k &&
      (k.startsWith("pk_test_") || k.startsWith("pk_live_")) &&
      !k.includes("xxx"),
  );
}

/**
 * Publishable + secret — pour middleware et routes API (ne pas importer dans du code client).
 */
export function hasFullClerkConfig(): boolean {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const sk = process.env.CLERK_SECRET_KEY;
  return Boolean(
    pk &&
      sk &&
      (pk.startsWith("pk_test_") || pk.startsWith("pk_live_")) &&
      !pk.includes("xxx") &&
      (sk.startsWith("sk_test_") || sk.startsWith("sk_live_")) &&
      !sk.includes("xxx"),
  );
}
