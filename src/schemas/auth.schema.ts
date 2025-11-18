const registerSchema = {
  tags: ["Auth"],
  description: "Register a new member account",
  body: {
    type: "object",
    required: ["email", "password", "name"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
      name: { type: "string", minLength: 3 },
    },
  },
  response: {
    201: {
      description: "User registered successfully",
      type: "object",
      properties: {
        message: { type: "string" },
        userId: { type: "string" },
      },
    },
    400: { description: "Invalid input / email exists" },
  },
};

const loginSchema = {
  tags: ["Auth"],
  description: "Login with email and password",
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
  },
  response: {
    200: {
      description: "Successful login",
      type: "object",
      properties: {
        accessToken: { type: "string" },
        refreshToken: { type: "string" },
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            name: { type: "string" },
            role: { type: "string" },
          },
        },
      },
    },
    401: { description: "Invalid credentials" },
  },
};

const refreshTokenSchema = {
  tags: ["Auth"],
  description: "Refresh an expired access token",
  security: [{ bearerAuth: [] }],
  body: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: { type: "string" },
    },
  },
  response: {
    200: {
      description: "New access token and rotated refresh token",
      type: "object",
      properties: {
        accessToken: { type: "string" },
        refreshToken: { type: "string" },
      },
    },
    401: { description: "Invalid refresh token" },
  },
};

const createAdminSchema = {
  tags: ["Auth"],
  description: "Create an admin user (requires X-Admin-Secret header)",
  body: {
    type: "object",
    required: ["email", "password", "name"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
      name: { type: "string", minLength: 3 },
    },
  },
  headers: {
    type: "object",
    required: ["x-admin-secret"],
    properties: {
      "x-admin-secret": { type: "string" },
    },
  },
  response: {
    201: {
      description: "Admin created",
      type: "object",
      properties: {
        message: { type: "string" },
        userId: { type: "string" },
        role: { type: "string" },
      },
    },
    401: { description: "Missing or invalid admin secret" },
  },
};

const getAuthenticatedUserSchema = {
  tags: ["Auth"],
  description: "Get the currently authenticated user's information",
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      description: "Authenticated user's info",
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string" },
        name: { type: "string" },
        role: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
    401: { description: "Unauthorized - Invalid or missing token" },
  },
};

const logoutSchema = {
  tags: ["Auth"],
  description: "Logout the current user and invalidate the refresh token",
  response: {
    200: {
      description: "Logout successful",
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    401: { description: "Unauthorized - invalid or missing token" },
  },
};

export {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  createAdminSchema,
  logoutSchema,
  getAuthenticatedUserSchema,
};
