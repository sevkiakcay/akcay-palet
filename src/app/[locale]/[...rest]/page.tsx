import { notFound } from "next/navigation";

// Any path under a known locale that no route matches lands here, so the
// visitor gets the localized not-found page (inside the locale layout) instead
// of the framework's unbranded English default. The response is a real 404 and
// Next.js adds `noindex` to it; the <title> stays the layout's site title,
// because a route that throws `notFound()` does not contribute metadata.
export default function CatchAll() {
  notFound();
}
