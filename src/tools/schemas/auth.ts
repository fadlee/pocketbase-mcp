/**
 * Tool input schemas for authentication-related operations
 */

export const authenticateUserSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Auth collection name (default: 'users')",
    },
    email: {
      type: "string",
      description: "User email or identity field value",
    },
    password: {
      type: "string",
      description: "User password",
    },
    autoRefreshThreshold: {
      type: "number",
      description: "Time in seconds that will trigger token auto refresh before its expiration (default: 30 minutes)",
    },
  },
  required: ["email", "password"],
};

export const createUserSchema = {
  type: "object",
  properties: {
    collection: {
      type: "string",
      description: "Auth collection name (default: 'users')",
    },
    email: {
      type: "string",
      description: "User email",
    },
    password: {
      type: "string",
      description: "User password",
    },
    passwordConfirm: {
      type: "string",
      description: "Password confirmation (must match password)",
    },
    verified: {
      type: "boolean",
      description: "Whether the user is verified (default: false)",
    },
    emailVisibility: {
      type: "boolean",
      description: "Whether the user email is publicly visible (default: false)",
    },
    additionalData: {
      type: "object",
      description: "Additional user data fields specific to your auth collection",
    },
  },
  required: ["email", "password", "passwordConfirm"],
};