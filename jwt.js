const jwt = require("jsonwebtoken");
const User = require("./models/user");

const jwtAuthMiddleware = async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization){
        return res.status(401).json({ message: "No token found" });
    } 
    
    const token = authorization.split(" ")[1];
    // const token = authorization;
    // console.log(token);
    if(!token) return res.status(401).json({ message: "No token found" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
        if(!user) return res.status(404).json({message: "user not found"})
        req.user = user;
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(401).json({ message: "Invalid token" });
    }
}

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET)
}
module.exports = { generateToken, jwtAuthMiddleware };