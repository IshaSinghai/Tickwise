/*
 * Every routed page.tsx under src/app.
 *
 * One dynamic segment exists: /admin/clients/[id]. It is listed as a concrete
 * instance, because a sweep needs a URL it can actually visit — `cli_100` is the
 * first row of the client list, so it resolves whether the panel is being served
 * the fallback or a real response.
 */
export const ROUTES = [
  "/",
  "/admin",
  "/admin/clients/cli_100",
  "/admin/endpoints",
  "/admin/login",
  "/admin/payments",
  "/admin/plans",
  "/admin/revenue",
  "/admin/subscriptions",
  "/changelog",
  "/contact",
  "/docs",
  "/docs/authentication",
  "/docs/coverage",
  "/docs/endpoints/metadata",
  "/docs/endpoints/pools",
  "/docs/endpoints/positions",
  "/docs/errors",
  "/docs/quickstart",
  "/docs/units-and-limits",
  "/explore",
  "/forgot-password",
  "/legal/dpa",
  "/legal/privacy",
  "/legal/terms",
  "/login",
  "/portal",
  "/portal/billing",
  "/portal/billing/plans",
  "/portal/checkout/return",
  "/portal/keys",
  "/portal/playground",
  "/portal/settings",
  "/portal/usage",
  "/pricing",
  "/reset-password",
  "/signup",
  "/status",
  "/support",
  "/verify-email",
] as const;
