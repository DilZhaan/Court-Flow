import test from "node:test";
import assert from "node:assert/strict";

import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import { FACILITY_STATUS } from "../src/constants/facilityStatus.js";
import { ROLES } from "../src/constants/roles.js";
import Booking from "../src/models/Booking.js";
import Facility from "../src/models/Facility.js";
import User from "../src/models/User.js";
import { createBooking } from "../src/services/bookingService.js";

let replSet;
let actor;
let facility;

const bookingPayload = (overrides = {}) => ({
  facility: facility._id,
  clientName: "Test Client",
  sessionType: "Training",
  startAt: new Date("2026-06-01T10:00:00.000Z"),
  endAt: new Date("2026-06-01T11:00:00.000Z"),
  notes: "",
  ...overrides,
});

test.before(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
});

test.beforeEach(async () => {
  await mongoose.connection.dropDatabase();

  actor = await User.create({
    firebaseUid: "coach-1",
    email: "coach@example.com",
    displayName: "Coach One",
    role: ROLES.STAFF,
  });

  facility = await Facility.create({
    code: "CT-01",
    name: "Court 1",
    location: "Colombo",
    sportType: "Tennis",
    capacity: 4,
    pricePerHour: 2500,
    status: FACILITY_STATUS.AVAILABLE,
  });
});

test.after(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

test("rejects overlapping active bookings for the same facility", async () => {
  await createBooking(bookingPayload(), actor);

  await assert.rejects(
    () =>
      createBooking(
        bookingPayload({
          startAt: new Date("2026-06-01T10:30:00.000Z"),
          endAt: new Date("2026-06-01T11:30:00.000Z"),
        }),
        actor
      ),
    { statusCode: 409 }
  );

  assert.equal(await Booking.countDocuments(), 1);
});

test("allows adjacent bookings for the same facility", async () => {
  await createBooking(bookingPayload(), actor);
  await createBooking(
    bookingPayload({
      startAt: new Date("2026-06-01T11:00:00.000Z"),
      endAt: new Date("2026-06-01T12:00:00.000Z"),
    }),
    actor
  );

  assert.equal(await Booking.countDocuments(), 2);
});

test("allows overlapping times on different facilities", async () => {
  const secondFacility = await Facility.create({
    code: "CT-02",
    name: "Court 2",
    location: "Colombo",
    sportType: "Tennis",
    capacity: 4,
    pricePerHour: 2500,
    status: FACILITY_STATUS.AVAILABLE,
  });

  await createBooking(bookingPayload(), actor);
  await createBooking(bookingPayload({ facility: secondFacility._id }), actor);

  assert.equal(await Booking.countDocuments(), 2);
});

test("serializes concurrent bookings for the same facility", async () => {
  const results = await Promise.allSettled([
    createBooking(bookingPayload({ clientName: "Client A" }), actor),
    createBooking(bookingPayload({ clientName: "Client B" }), actor),
  ]);

  const fulfilled = results.filter((result) => result.status === "fulfilled");
  const rejected = results.filter((result) => result.status === "rejected");

  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].reason.statusCode, 409);
  assert.equal(await Booking.countDocuments(), 1);
});
