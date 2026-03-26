const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

exports.checkJWT =  (req, res, next) => {
  
  // Tryna find the token in cookies or header, wherever its hidden
  let token = req.cookies.token || req.headers["x-access-token"] || req.headers["authorization"];

  if (token) {
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        // Token is dead or fake? Clear it and kick them back to home
        res.clearCookie("token");
        return res.redirect("/");
      } 

        req.decoded = decoded;

        // Keep the session alive for another day so they don't have to relogin constantly
        const expiresIn = 24 * 60 * 60;
        const newToken = jwt.sign(
          { user: decoded.user },
          SECRET_KEY,
          { expiresIn: expiresIn },
        );

        // Update everything so the next request actually works
        res.header("Authorization", "Bearer " + newToken);
        res.cookie("token", newToken, { httpOnly: true, secure: false });
        
        next();
    });
  } else {
    // No token = no entry. Back to the start.
    return res.redirect("/");
  }
};
