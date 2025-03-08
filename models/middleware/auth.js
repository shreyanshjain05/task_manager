const jwt = require('jsonwebtoken');
const User = require('../user');

const auth = async (req, res, next) => {
    try {
        // Step 1: Check if the Authorization header exists
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).send({ error: "Authorization header missing" });
        }

        // Step 2: Extract the token from the Authorization header
        const token = authHeader.replace("Bearer ", "");

        // Step 3: Verify the token using the JWT_SECRET_KEY
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Step 4: Look up the user by _id from the decoded token
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            return res.status(401).send({ error: "User not found" });
        }

        // Step 5: Check if the token exists in the user's tokens array
        if (!user.tokens || !user.tokens.some(t => t.token === token)) {
            return res.status(401).send({ error: "Token not found in user tokens" });
        }

        // Step 6: Attach the user and token to the request object
        req.user = user;
        req.token = token;
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        // Handle errors such as invalid/expired token
        res.status(401).send({ error: "Invalid or expired token" });
    }
};

module.exports = auth;