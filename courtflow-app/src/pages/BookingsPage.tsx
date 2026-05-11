import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Ban, CalendarPlus, Search } from "lucide-react";

import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Field } from "../components/Field";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { SelectField } from "../components/SelectField";
import { StatusBadge } from "../components/StatusBadge";
import { TextareaField } from "../components/TextareaField";
import {
  useCancelBookingMutation,
  useCreateBookingMutation,
  useGetBookingsQuery,
  useGetFacilitiesQuery,
  useGetMeQuery,
} from "../features/api/courtflowApi";
import { useApiError } from "../hooks/useApiError";
import { useRoleAccess } from "../hooks/useRoleAccess";
import type { Booking, BookingPayload } from "../types/domain";
import {
  formatDateTime,
  fromInputDateTime,
  toInputDateTime,
} from "../utils/date";

interface BookingFormValues {
  facilityId: string;
  clientName: string;
  sessionType: string;
  startAt: string;
  endAt: string;
  notes: string;
}

interface CancelFormValues {
  cancellationReason: string;
}

interface BookingFilters {
  facilityId: string;
  status: string;
  from: string;
  to: string;
}

export function BookingsPage() {
  const getApiError = useApiError();
  const { data: me } = useGetMeQuery();
  const access = useRoleAccess(me?.role);
  const [filters, setFilters] = useState<BookingFilters>({
    facilityId: "",
    status: "",
    from: "",
    to: "",
  });
  const { data: bookings = [], isLoading } = useGetBookingsQuery(filters);
  const [createBooking] = useCreateBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [bookingDefaults] = useState<BookingFormValues>(() => {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    return {
      facilityId: "",
      clientName: "",
      sessionType: "",
      startAt: toInputDateTime(start),
      endAt: toInputDateTime(end),
      notes: "",
    };
  });
  const bookingForm = useForm<BookingFormValues>({
    defaultValues: bookingDefaults,
  });
  const watchStartAt = bookingForm.watch("startAt");
  const watchEndAt = bookingForm.watch("endAt");
  const facilityFilters = useMemo(() => {
    if (!watchStartAt || !watchEndAt) return undefined;
    return {
      startAt: fromInputDateTime(watchStartAt),
      endAt: fromInputDateTime(watchEndAt),
    };
  }, [watchEndAt, watchStartAt]);
  const { data: facilities = [] } = useGetFacilitiesQuery(facilityFilters);
  const cancelForm = useForm<CancelFormValues>({
    defaultValues: { cancellationReason: "" },
  });
  const filterForm = useForm<BookingFilters>({ defaultValues: filters });

  const facilityOptions = useMemo(
    () => [
      { label: "Select facility", value: "" },
      ...facilities
        .filter((facility) => facility.status === "AVAILABLE")
        .map((facility) => ({
          label: `${facility.code} · ${facility.name}`,
          value: facility._id,
        })),
    ],
    [facilities],
  );

  const submitBooking = async (values: BookingFormValues) => {
    const payload: BookingPayload = {
      ...values,
      startAt: fromInputDateTime(values.startAt),
      endAt: fromInputDateTime(values.endAt),
    };
    setError("");
    try {
      await createBooking(payload).unwrap();
      setModalOpen(false);
      bookingForm.reset();
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  };

  const submitCancel = async (values: CancelFormValues) => {
    if (!cancelTarget) return;
    setError("");
    try {
      await cancelBooking({
        id: cancelTarget._id,
        cancellationReason: values.cancellationReason,
      }).unwrap();
      setCancelTarget(null);
      cancelForm.reset();
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Session",
        render: (booking: Booking) => (
          <div>
            <strong>{booking.clientName}</strong>
            <span className="muted block">
              {booking.sessionType || "Session"}
            </span>
          </div>
        ),
      },
      {
        header: "Facility",
        render: (booking: Booking) =>
          `${booking.facility.code} · ${booking.facility.name}`,
      },
      {
        header: "Time",
        render: (booking: Booking) => (
          <span>
            {formatDateTime(booking.startAt)} - {formatDateTime(booking.endAt)}
          </span>
        ),
      },
      {
        header: "Booked by",
        render: (booking: Booking) =>
          booking.bookedBy?.displayName || booking.bookedBy?.email || "-",
      },
      {
        header: "Status",
        render: (booking: Booking) => <StatusBadge value={booking.status} />,
      },
      {
        header: "Actions",
        className: "actions-column",
        render: (booking: Booking) => {
          const isOwner = booking.bookedBy?._id === me?._id;
          const canCancel =
            access.canManageBookings &&
            booking.status === "ACTIVE" &&
            (me?.role === "MANAGER" || isOwner);
          return canCancel ? (
            <Button
              variant="danger"
              icon={<Ban size={15} />}
              onClick={() => setCancelTarget(booking)}
            >
              Cancel
            </Button>
          ) : null;
        },
      },
    ],
    [access.canManageBookings, me?._id, me?.role],
  );

  return (
    <section className="page-stack">
      <PageHeader
        title="Bookings"
        description="Book, cancel, and review full booking history."
        actions={
          access.canManageBookings ? (
            <Button
              icon={<CalendarPlus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Create booking
            </Button>
          ) : null
        }
      />
      <form
        className="filter-bar"
        onSubmit={filterForm.handleSubmit(setFilters)}
      >
        <SelectField
          label="Facility"
          options={facilityOptions}
          {...filterForm.register("facilityId")}
        />
        <SelectField
          label="Status"
          options={[
            { label: "All", value: "" },
            { label: "Active", value: "ACTIVE" },
            { label: "Cancelled", value: "CANCELLED" },
          ]}
          {...filterForm.register("status")}
        />
        <Field
          label="From"
          type="datetime-local"
          {...filterForm.register("from")}
        />
        <Field
          label="To"
          type="datetime-local"
          {...filterForm.register("to")}
        />
        <Button type="submit" icon={<Search size={16} />}>
          Filter
        </Button>
      </form>
      {bookings.length ? (
        <DataTable
          rows={bookings}
          getKey={(booking) => booking._id}
          columns={columns}
        />
      ) : (
        <EmptyState
          title="No bookings found"
          message={
            isLoading
              ? "Loading bookings."
              : "Try changing your filters or create a booking."
          }
        />
      )}
      <Modal
        title="Create booking"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form
          className="form-grid"
          onSubmit={bookingForm.handleSubmit(submitBooking)}
        >
          <Alert message={error} tone="error" />
          <SelectField
            label="Facility"
            options={facilityOptions}
            error={bookingForm.formState.errors.facilityId}
            {...bookingForm.register("facilityId", {
              required: "Facility is required",
            })}
          />
          <Field
            label="Client name"
            error={bookingForm.formState.errors.clientName}
            {...bookingForm.register("clientName", {
              required: "Client name is required",
            })}
          />
          <Field
            label="Session type"
            {...bookingForm.register("sessionType")}
          />
          <Field
            label="Start"
            type="datetime-local"
            error={bookingForm.formState.errors.startAt}
            {...bookingForm.register("startAt", {
              required: "Start time is required",
            })}
          />
          <Field
            label="End"
            type="datetime-local"
            error={bookingForm.formState.errors.endAt}
            {...bookingForm.register("endAt", {
              required: "End time is required",
            })}
          />
          <TextareaField label="Notes" {...bookingForm.register("notes")} />
          <div className="form-actions">
            <Button type="submit">Save booking</Button>
          </div>
        </form>
      </Modal>
      <Modal
        title="Cancel booking"
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
      >
        <form
          className="form-grid"
          onSubmit={cancelForm.handleSubmit(submitCancel)}
        >
          <Alert message={error} tone="error" />
          <TextareaField
            label="Reason"
            error={cancelForm.formState.errors.cancellationReason}
            {...cancelForm.register("cancellationReason", {
              required: "Reason is required",
            })}
          />
          <div className="form-actions">
            <Button variant="danger" type="submit">
              Confirm cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
