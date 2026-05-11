import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Edit, Plus, Search, Trash2 } from "lucide-react";

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
  useCreateFacilityMutation,
  useDeleteFacilityMutation,
  useGetFacilitiesQuery,
  useGetMeQuery,
  useUpdateFacilityMutation,
} from "../features/api/courtflowApi";
import { useApiError } from "../hooks/useApiError";
import { useRoleAccess } from "../hooks/useRoleAccess";
import type {
  Facility,
  FacilityPayload,
  FacilityStatus,
} from "../types/domain";
import { formatCurrency } from "../utils/currency";

interface FacilityFormValues {
  code: string;
  name: string;
  location: string;
  sportType: string;
  capacity: number;
  pricePerHour: number;
  status: FacilityStatus;
  notes: string;
}

interface FacilitySearchValues {
  location: string;
  capacity: string;
  search: string;
  startAt: string;
  endAt: string;
}

const statusOptions = [
  { label: "Available", value: "AVAILABLE" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Inactive", value: "INACTIVE" },
];

const emptyFacility: FacilityFormValues = {
  code: "",
  name: "",
  location: "",
  sportType: "",
  capacity: 1,
  pricePerHour: 0,
  status: "AVAILABLE",
  notes: "",
};

export function FacilitiesPage() {
  const getApiError = useApiError();
  const { data: me } = useGetMeQuery();
  const access = useRoleAccess(me?.role);
  const [filters, setFilters] = useState<FacilitySearchValues>({
    location: "",
    capacity: "",
    search: "",
    startAt: "",
    endAt: "",
  });
  const [editing, setEditing] = useState<Facility | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const { data: facilities = [], isLoading } = useGetFacilitiesQuery(filters);
  const [createFacility] = useCreateFacilityMutation();
  const [updateFacility] = useUpdateFacilityMutation();
  const [deleteFacility] = useDeleteFacilityMutation();
  const form = useForm<FacilityFormValues>({ defaultValues: emptyFacility });
  const searchForm = useForm<FacilitySearchValues>({ defaultValues: filters });

  const openCreate = () => {
    setEditing(null);
    setError("");
    form.reset(emptyFacility);
    setModalOpen(true);
  };

  const openEdit = useCallback(
    (facility: Facility) => {
      setEditing(facility);
      setError("");
      form.reset({
        code: facility.code,
        name: facility.name,
        location: facility.location,
        sportType: facility.sportType,
        capacity: facility.capacity,
        pricePerHour: facility.pricePerHour,
        status: facility.status,
        notes: facility.notes || "",
      });
      setModalOpen(true);
    },
    [form],
  );

  const submitFacility = async (values: FacilityFormValues) => {
    const payload: FacilityPayload = {
      ...values,
      capacity: Number(values.capacity),
      pricePerHour: Number(values.pricePerHour),
    };
    setError("");
    try {
      if (editing)
        await updateFacility({ id: editing._id, body: payload }).unwrap();
      else await createFacility(payload).unwrap();
      setModalOpen(false);
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Facility",
        render: (facility: Facility) => (
          <div>
            <strong>{facility.name}</strong>
            <span className="muted block">
              {facility.code} · {facility.sportType}
            </span>
          </div>
        ),
      },
      { header: "Location", render: (facility: Facility) => facility.location },
      { header: "Capacity", render: (facility: Facility) => facility.capacity },
      {
        header: "Rate",
        render: (facility: Facility) => formatCurrency(facility.pricePerHour),
      },
      {
        header: "Status",
        render: (facility: Facility) => {
          const statusValue =
            facility.status === "AVAILABLE" && facility.isBooked
              ? "BOOKED"
              : facility.status;
          return <StatusBadge value={statusValue} />;
        },
      },
      {
        header: "Actions",
        className: "actions-column",
        render: (facility: Facility) =>
          access.canManageFacilities ? (
            <div className="row-actions">
              <Button
                variant="secondary"
                icon={<Edit size={15} />}
                onClick={() => openEdit(facility)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 size={15} />}
                onClick={() => deleteFacility(facility._id)}
              >
                Delete
              </Button>
            </div>
          ) : null,
      },
    ],
    [access.canManageFacilities, deleteFacility, openEdit],
  );

  return (
    <section className="page-stack">
      <PageHeader
        title="Facilities"
        description="Find, create, and maintain courts and training areas."
        actions={
          access.canManageFacilities ? (
            <Button icon={<Plus size={16} />} onClick={openCreate}>
              Add facility
            </Button>
          ) : null
        }
      />
      <form
        className="filter-bar"
        onSubmit={searchForm.handleSubmit(setFilters)}
      >
        <Field
          label="Search"
          placeholder="Name, code, sport"
          {...searchForm.register("search")}
        />
        <Field
          label="Location"
          placeholder="Colombo"
          {...searchForm.register("location")}
        />
        <Field
          label="Min capacity"
          type="number"
          min="1"
          {...searchForm.register("capacity")}
        />
        <Field
          label="Start"
          type="datetime-local"
          {...searchForm.register("startAt")}
        />
        <Field
          label="End"
          type="datetime-local"
          {...searchForm.register("endAt")}
        />
        <Button type="submit" icon={<Search size={16} />}>
          Search
        </Button>
      </form>
      {facilities.length ? (
        <DataTable
          rows={facilities}
          getKey={(facility) => facility._id}
          columns={columns}
        />
      ) : (
        <EmptyState
          title="No facilities found"
          message={
            isLoading ? "Loading facilities." : "Try changing your filters."
          }
        />
      )}
      <Modal
        title={editing ? "Edit facility" : "Create facility"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form
          className="form-grid"
          onSubmit={form.handleSubmit(submitFacility)}
        >
          <Alert message={error} tone="error" />
          <Field
            label="Code"
            error={form.formState.errors.code}
            {...form.register("code", { required: "Code is required" })}
          />
          <Field
            label="Name"
            error={form.formState.errors.name}
            {...form.register("name", { required: "Name is required" })}
          />
          <Field
            label="Location"
            error={form.formState.errors.location}
            {...form.register("location", { required: "Location is required" })}
          />
          <Field
            label="Sport type"
            error={form.formState.errors.sportType}
            {...form.register("sportType", {
              required: "Sport type is required",
            })}
          />
          <Field
            label="Capacity"
            type="number"
            min="1"
            error={form.formState.errors.capacity}
            {...form.register("capacity", {
              required: "Capacity is required",
              min: { value: 1, message: "Capacity must be at least 1" },
            })}
          />
          <Field
            label="Price per hour"
            type="number"
            min="0"
            error={form.formState.errors.pricePerHour}
            {...form.register("pricePerHour", {
              required: "Price is required",
              min: { value: 0, message: "Price cannot be negative" },
            })}
          />
          <SelectField
            label="Status"
            options={statusOptions}
            {...form.register("status")}
          />
          <TextareaField label="Notes" {...form.register("notes")} />
          <div className="form-actions">
            <Button type="submit">Save facility</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
