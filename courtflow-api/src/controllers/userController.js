import {
  createUserDto,
  updateUserRoleDto,
  updateUserStatusDto,
} from "../dtos/userDto.js";
import {
  createUser,
  listUsers,
  updateUserRole,
  updateUserStatus,
} from "../services/userService.js";
import asyncHandler from "../utils/asyncHandler.js";

const getMe = asyncHandler(async (req, res) => {
  res.success(req.user, "Current user fetched");
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await listUsers();

  res.success(users, "Users fetched");
});

const postUser = asyncHandler(async (req, res) => {
  const payload = createUserDto(req.body);
  const user = await createUser(payload, req.user);

  res.created(user, "User created");
});

const patchUserRole = asyncHandler(async (req, res) => {
  const payload = updateUserRoleDto(req.params, req.body);
  const user = await updateUserRole(payload, req.user);

  res.success(user, "User role updated");
});

const patchUserStatus = asyncHandler(async (req, res) => {
  const payload = updateUserStatusDto(req.params, req.body);
  const user = await updateUserStatus(payload, req.user);

  res.success(user, "User status updated");
});

export { getMe, getUsers, patchUserRole, patchUserStatus, postUser };
