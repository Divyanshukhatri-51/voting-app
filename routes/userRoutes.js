const router = require("express").Router();
const { generateToken, jwtAuthMiddleware } = require("../jwt.js");
const User = require("../models/user.js");

//post route to add a new user
router.post("/signup", async (req, res) => {
    try {
        const data = req.body;
        const newUser = new User(data);
        const response = await newUser.save();
        console.log('data saved');
        
        const payload = {
            id: response.id
        }
        const token = generateToken(payload);
        console.log(token);
        return res.status(201).json({
            message: "User created successfully",
            token: token,
            user: response
        });
    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error", error: error.message});
    }
})

//login route
router.post("/login", async (req, res) =>{
    try {
        const { aadharCardNumber, password } = req.body;
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber })

        if(!user || !(await user.comparePassword(password))) {
            return  res.status(401).json({ message: "Invalid Credentials" });
        }
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);
        res.json({token});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error", error: error.message});
    }
})

//profile route
router.get("/profile", async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId)
        res.status(200).json({user});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error", error: error.message});
    }
})

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
    try{
        const userId = req.user;
        const { currPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if(!(await user.comparePassword(currPassword))) {
            return  res.status(401).json({ message: "Invalid Credentials" });
        }

        user.password = newPassword;
        await user.save();
        console.log("password updated");
        res.status(200).json({message: "Password updated successfully"});
    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error", error: error.message});
    }
})

module.exports = router;