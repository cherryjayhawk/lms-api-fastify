const userEntity = {
  type: "object",
  properties: {
    _id: { type: "string" },
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
};

const getAllUsersSchema = {
  tags: ["Users"],
  description: "Get all users (admin only)",
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: "array",
      items: userEntity,
    },
    403: { description: "Forbidden" },
  },
};

const getUserByIdSchema = {
  tags: ["Users"],
  description: "Get a user by ID (self or admin)",
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: userEntity,
    404: { description: "User not found" },
  },
};

const updateUserSchema = {
  tags: ["Users"],
  description:
    "Update user profile. Only the user themselves or admin can update.",
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  body: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 3 },
      // intentionally only name allowed
      // email, password, role blocked by service layer
    },
  },
  response: {
    200: userEntity,
    400: { description: "Invalid update or user not found" },
    403: { description: "Forbidden" },
  },
};

const deleteUserSchema = {
  tags: ["Users"],
  description: "Delete a user (admin only)",
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    404: { description: "User not found" },
  },
};

export {
  getAllUsersSchema,
  getUserByIdSchema,
  updateUserSchema,
  deleteUserSchema,
};
