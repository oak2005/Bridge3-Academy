import { NextResponse } from "next/server";

/**
 * Same as NextResponse.json, but with an explicit Cache-Control header
 * that no caching layer (browser, Vercel's edge network, an intermediate
 * proxy) can reasonably ignore. `export const dynamic = "force-dynamic"`
 * should already prevent caching on its own, but for the admin and
 * mentor data routes — where showing a stale result is actively
 * misleading — this removes any remaining doubt.
 */
export function jsonNoStore(data: unknown, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  return response;
}
