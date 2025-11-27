export const config = {
  runtime: "edge",
};

export default function handler(req) {
  const country = req.headers.get("x-vercel-ip-country") || "UNKNOWN";

  // Block USA
  if (country === "US") {
    return new Response(
      `
      <html>
        <body style="background:black;color:white;text-align:center;padding:50px;font-family:sans-serif;">
          <h1>🚫 Access Restricted</h1>
          <p>AIcontrib is not available in your region.</p>
        </body>
      </html>
      `,
      {
        status: 451,
        headers: {
          "content-type": "text/html",
        },
      }
    );
  }

  // Allow request through
  return new Response(null, { status: 200 });
}
