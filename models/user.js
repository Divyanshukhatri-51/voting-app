const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//Define the person schema
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    age:{
        type: Number,
        required: true
    },
    mobile:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        unique: true,
    },
    address:{
        type: String,
        required: true
    },
    aadharCardNumber:{
        type: Number,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ["voter", "admin"],
        default: "voter",
        required: true
    },
    isVoted:{
        type: Boolean,
        default: false
    }
});

userSchema.pre('save', async function(next){
    const user = this;
    if(!user.isModified('password')) return next();
    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        next();
    } catch(error) {
        return next(error);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword) {
    try{
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch(error) {
        throw new Error(error);
    }
}

const User = mongoose.model("User", userSchema);
module.exports = User;