import {
  createFacilityDto,
  facilityIdDto,
  facilitySearchDto,
  updateFacilityDto,
} from "../dtos/facilityDto.js";
import {
  createFacility,
  getFacilityById,
  listFacilities,
  removeFacility,
  updateFacility,
} from "../services/facilityService.js";
import asyncHandler from "../utils/asyncHandler.js";

const getFacilities = asyncHandler(async (req, res) => {
  const filters = facilitySearchDto(req.query);
  const facilities = await listFacilities(filters);

  res.success(facilities, "Facilities fetched");
});

const getFacility = asyncHandler(async (req, res) => {
  const { id } = facilityIdDto(req.params);
  const facility = await getFacilityById(id);

  res.success(facility, "Facility fetched");
});

const postFacility = asyncHandler(async (req, res) => {
  const payload = createFacilityDto(req.body);
  const facility = await createFacility(payload, req.user);

  res.created(facility, "Facility created");
});

const patchFacility = asyncHandler(async (req, res) => {
  const { id } = facilityIdDto(req.params);
  const payload = updateFacilityDto(req.body);
  const facility = await updateFacility(id, payload, req.user);

  res.success(facility, "Facility updated");
});

const deleteFacility = asyncHandler(async (req, res) => {
  const { id } = facilityIdDto(req.params);
  await removeFacility(id, req.user);

  res.noContent();
});

export { deleteFacility, getFacilities, getFacility, patchFacility, postFacility };
