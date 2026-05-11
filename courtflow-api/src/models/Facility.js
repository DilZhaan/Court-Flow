import mongoose from "mongoose";

import {
  FACILITY_STATUS,
  FACILITY_STATUS_VALUES,
} from "../constants/facilityStatus.js";

const facilitySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    sportType: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: FACILITY_STATUS_VALUES,
      default: FACILITY_STATUS.AVAILABLE,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

facilitySchema.index({ location: 1, capacity: 1, status: 1 });
facilitySchema.index({ name: "text", code: "text", location: "text", sportType: "text" });

const Facility = mongoose.model("Facility", facilitySchema);

export default Facility;
