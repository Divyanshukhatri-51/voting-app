const router = require("express").Router();
const { generateToken, jwtAuthMiddleware } = require("../jwt.js");
const Candidate = require("../models/candidate.js");
const User = require("../models/user.js");

const checkAdminRole = async (userId) => {
    try{
        const user = await User.findById(userId);
        if(user.role === "admin"){
            return true;
        }
    } catch(err){
        return false;
    }
}

//post route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
    try {
        if(!(await checkAdminRole(req.user.id))){
            console.log("requested user",req.user.role);
            console.log('admin role not found');
            return res.status(403).json({message: "Access Denied"});
        }
        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response: response})
    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error", error: error.message});
    }
})

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try{
         if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: "Access Denied"});
        }
        const candidateId = req.params.candidateId;
        const updatedUserData = req.body;
        const response = await User.findByIdAndUpdate(candidateId, updatedUserData, {new: true});
        if(!response){
            return res.status(404).json({ message: "user not found" });
        }
        console.log("candidate updated");
        res.status(200).json(response);
    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error", error: error.message});
    }
})
router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try{
         if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: "Access Denied"});
        }
        const candidateId = req.params.candidateId;
        const response = await User.findByIdAndDelete(candidateId);
        if(!response){
            return res.status(404).json({ message: "user not found" });
        }
        console.log("candidate deleted");
        res.status(200).json(response);
    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error", error: error.message});
    }
})

router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    const candidateId = req.params.candidateID;
    const userId = req.user.id;
    console.log(userId);
    try{
        //find the candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({message: "candidate not found"})
        }

        const user = await User.findById(userId);
        
        if(!user){
            res.status(404).json({message: "user not found"})
        }

        //user can only vote once
        if(user.isVoted){
            return res.status(400).json({message: "you have already voted"})
        }

        //no admin can vote
        if(user.role == 'admin'){
            return res.status(403).json({message: "admin is not allowed"})
        }

        //update the candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        //update the user document
        user.isVoted = true
        await user.save();

        res.status(200).json({message: "vote recorded successfully"})
    } catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal server error"})
    }
})

//vote count
router.get('/vote/count', async(req, res)=>{
    try{
        const candidate = await Candidate.find().sort({voteCount: 'desc'});
        const voteRecord = candidate.map((data)=>{
            return{
                party: data.party,
                count: data.voteCount
            }
        })
        return res.status(200).json(voteRecord)
    } catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router;