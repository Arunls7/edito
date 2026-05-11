const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;

export default {
  providers:
    domain && domain.length > 0
      ? [
          {
            domain,
            applicationID: "convex",
          },
        ]
      : [],
};
