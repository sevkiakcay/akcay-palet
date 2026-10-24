import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed `middleware.ts` to `proxy.ts`. Detects the visitor's
// language from the NEXT_LOCALE cookie, then Accept-Language, and redirects.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals and any file with an extension
  // (hero frames, videos, images, sitemap.xml, robots.txt).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
