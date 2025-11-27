// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const country = request.geo?.country || "UNKNOWN";

  // Block US visitors
  if (country === "US") {
    return new NextResponse(
      JSON.stringify({
        error: "Access restricted. AIcontrib is not available in your region.",
      }),
      {
        status: 451, // Unavailable For Legal Reasons
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }

  return NextResponse.next();
}

// Optional: only apply middleware to app routes
export const config = {
  matcher: "/:path*", // apply to entire site
};
