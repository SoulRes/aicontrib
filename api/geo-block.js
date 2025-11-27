export default function handler(req) {
  const country = req.geo?.country || "unknown";

  if (country === "US") {
    return new Response(
      `
      <html>
        <head>
          <title>Access Restricted</title>
          <style>
            body { background:black; color:white; text-align:center; padding:70px; font-family:Arial; }
            h1 { color:#ff4444; }
          </style>
        </head>
        <body>
          <h1>Access Restricted</h1>
          <p>Our service is not available in your region.</p>
        </body>
      </html>
      `,
      {
        status: 451,
        headers: { "Content-Type": "text/html" }
      }
    );
  }

  // Let request continue normally
  return new Response(null, { status: 200 });
}
