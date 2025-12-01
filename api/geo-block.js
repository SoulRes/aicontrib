export default function handler(req, res) {
  const country = req.headers["x-vercel-ip-country"] || "unknown";

  if (country === "US") {
    return res.status(403).send(`
      <html>
        <body style="background:black; color:white; font-family:sans-serif; text-align:center; padding-top:50px;">
          <h1>Access Restricted</h1>
          <p>Our service is not available in the United States.</p>
        </body>
      </html>
    `);
  }

  // allow non-US traffic
  return res.status(200).end();
}
