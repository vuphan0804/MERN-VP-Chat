const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(400).json({ msg: "Invalid Authentication." });
    // deploy => verify
    // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    //   console.log(err, user);
    //   if (err) return res.status(400).json({ msg: "Invalid Authentication." });
    //   req.user = user;
    //   next();
    // });

    const decoded = jwt.decode(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
module.exports = auth;
