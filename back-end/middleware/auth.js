const { auth, db } = require("../utils/firebase");

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const userRef = db.collection("users").doc(decodedToken.uid);
    let userDoc = await userRef.get();
    let userData = {};

    if (!userDoc.exists) {
      userData = {
        email: decodedToken.email || "",
        createdAt: new Date()
      };
      await userRef.set(userData);
      userDoc = await userRef.get();
    } else {
      userData = userDoc.data();
    }

    // Attach _id for backward compatibility with Mongoose code
    req.user = {
      _id: decodedToken.uid,
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...userData,
    };
    
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
