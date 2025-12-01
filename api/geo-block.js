module.exports = (req, res) => {
  res.status(403).send(`
    <h1 style="font-family:Arial; color:red; text-align:center;">
      Access Denied
    </h1>
    <p style="text-align:center; color:#666;">
      Our service is not available in the United States.
    </p>
  `);
};
