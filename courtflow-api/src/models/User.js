import mongoose from "mongoose";

import { ROLE_VALUES, ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.STAFF,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isActive: 1 });

const User = mongoose.model("User", userSchema);

export default User;
