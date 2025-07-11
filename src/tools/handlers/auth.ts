import type PocketBase from "pocketbase";
import type {
  ToolHandler,
  AuthenticateUserArgs,
  CreateUserArgs
} from "../../types/index.ts";
import { handlePocketBaseError } from "../../utils/errors.ts";
import { createJsonResponse } from "../../utils/response.ts";

/**
 * Authenticate a user and get auth token
 */
export function createAuthenticateUserHandler(pb: PocketBase): ToolHandler {
  return async (args: AuthenticateUserArgs) => {
    try {
      const collection = args.collection || "users";
      const autoRefreshThreshold = args.autoRefreshThreshold || 1800; // 30 minutes

      const result = await pb
        .collection(collection)
        .authWithPassword(args.email, args.password, {
          autoRefreshThreshold,
        });

      return createJsonResponse(result);
    } catch (error: unknown) {
      throw handlePocketBaseError("authenticate user", error);
    }
  };
}

/**
 * Create a new user account
 */
export function createCreateUserHandler(pb: PocketBase): ToolHandler {
  return async (args: CreateUserArgs) => {
    try {
      const collection = args.collection || "users";

      const userData: any = {
        email: args.email,
        password: args.password,
        passwordConfirm: args.passwordConfirm,
      };

      // Add optional fields
      if (args.verified !== undefined) userData.verified = args.verified;
      if (args.emailVisibility !== undefined) userData.emailVisibility = args.emailVisibility;

      // Add any additional data fields
      if (args.additionalData) {
        Object.assign(userData, args.additionalData);
      }

      const result = await pb.collection(collection).create(userData);

      return createJsonResponse(result);
    } catch (error: unknown) {
      throw handlePocketBaseError("create user", error);
    }
  };
}
