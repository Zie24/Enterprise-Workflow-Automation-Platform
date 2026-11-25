const mongoose = require("mongoose");

const userSchema= new mongoose.Schema({
    avatar: {
    type: String,
    default: ""
},
     name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },
passwordChangedAt: { 
    type: Date
 },
    role: {
        type: String,
        enum: ["employee", "manager", "admin"],
        default: "employee"
    },

    department: {
        type: String,
        required: true,
        trim: true
    },

    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: { type: Boolean, default: false },
    preferences: {
  theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
  language: { type: String, default: "en" },
  emailNotifications: {
    requestUpdates: { type: Boolean, default: true },
    taskAssigned: { type: Boolean, default: true },
  },
},
})
const User = mongoose.model("User", userSchema);

module.exports = User;