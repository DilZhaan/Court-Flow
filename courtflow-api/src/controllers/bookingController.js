import {
  bookingIdDto,
  bookingQueryDto,
  cancelBookingDto,
  createBookingDto,
} from "../dtos/bookingDto.js";
import {
  cancelBooking,
  createBooking,
  getBookingById,
  listBookings,
} from "../services/bookingService.js";
import asyncHandler from "../utils/asyncHandler.js";

const getBookings = asyncHandler(async (req, res) => {
  const filters = bookingQueryDto(req.query);
  const bookings = await listBookings(filters, req.user);

  res.success(bookings, "Bookings fetched");
});

const getBooking = asyncHandler(async (req, res) => {
  const { id } = bookingIdDto(req.params);
  const booking = await getBookingById(id, req.user);

  res.success(booking, "Booking fetched");
});

const postBooking = asyncHandler(async (req, res) => {
  const payload = createBookingDto(req.body);
  const booking = await createBooking(payload, req.user);

  res.created(booking, "Booking created");
});

const cancelBookingById = asyncHandler(async (req, res) => {
  const payload = cancelBookingDto(req.params, req.body);
  const booking = await cancelBooking(payload, req.user);

  res.success(booking, "Booking cancelled");
});

export { cancelBookingById, getBooking, getBookings, postBooking };
