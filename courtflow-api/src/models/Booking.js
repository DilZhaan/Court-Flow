import mongoose from "mongoose";

import {
  BOOKING_STATUS,
  BOOKING_STATUS_VALUES,
} from "../constants/bookingStatus.js";

const bookingSchema = new mongoose.Schema(
  {
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    sessionType: {
      type: String,
      trim: true,
      default: "",
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: BOOKING_STATUS_VALUES,
      default: BOOKING_STATUS.ACTIVE,
      required: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

bookingSchema.index({ facility: 1, status: 1, startAt: 1, endAt: 1 });
bookingSchema.index({ bookedBy: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
