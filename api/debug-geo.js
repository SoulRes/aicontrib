module.exports = (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");

    res.status(200).json({
      country: req.headers["x-vercel-ip-country"] || "unknown",
      ip: req.headers["x-real-ip"] || "unknown",
      allHeaders: req.headers
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
