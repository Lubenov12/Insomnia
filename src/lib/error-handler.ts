import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiError {
  error: string;
  details?: unknown;
  field?: string;
  code?: string;
}

export class ValidationError extends Error {
  public details: unknown;
  public field?: string;

  constructor(message: string, details?: unknown, field?: string) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
    this.field = field;
  }
}

export class DatabaseError extends Error {
  public code?: string;
  public details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
    this.details = details;
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Access denied") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string = "Resource already exists") {
    super(message);
    this.name = "ConflictError";
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map(
      (err: { path: (string | number)[]; message: string; code: string }) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      })
    );

    return NextResponse.json(
      {
        error: "Validation failed",
        details: formattedErrors,
        message: "Please check your input and try again",
      },
      { status: 400 }
    );
  }

  // Custom validation errors
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
        field: error.field,
      },
      { status: 400 }
    );
  }

  // Database errors
  if (error instanceof DatabaseError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details:
          process.env.NODE_ENV === "development" ? error.details : undefined,
      },
      { status: 500 }
    );
  }

  // Authentication errors
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: "AUTHENTICATION_REQUIRED",
      },
      { status: 401 }
    );
  }

  // Authorization errors
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: "ACCESS_DENIED",
      },
      { status: 403 }
    );
  }

  // Not found errors
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        error: error.message,
        code: "NOT_FOUND",
      },
      { status: 404 }
    );
  }

  // Conflict errors
  if (error instanceof ConflictError) {
    return NextResponse.json(
      {
        error: error.message,
        code: "CONFLICT",
      },
      { status: 409 }
    );
  }

  // Supabase specific errors
  if (error?.code) {
    switch (error.code) {
      case "PGRST116":
        return NextResponse.json(
          {
            error: "Resource not found",
            code: "NOT_FOUND",
          },
          { status: 404 }
        );

      case "23505": // Unique violation
        return NextResponse.json(
          {
            error: "Resource already exists",
            code: "DUPLICATE_ENTRY",
            details: "This item already exists in the database",
          },
          { status: 409 }
        );

      case "23503": // Foreign key violation
        return NextResponse.json(
          {
            error: "Invalid reference",
            code: "INVALID_REFERENCE",
            details: "Referenced item does not exist",
          },
          { status: 400 }
        );

      case "23514": // Check constraint violation
        return NextResponse.json(
          {
            error: "Invalid data",
            code: "CONSTRAINT_VIOLATION",
            details: "Data does not meet required constraints",
          },
          { status: 400 }
        );

      default:
        return NextResponse.json(
          {
            error: "Database operation failed",
            code: error.code,
            details:
              process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
          },
          { status: 500 }
        );
    }
  }

  // Generic server errors
  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    },
    { status: 500 }
  );
}

export function validatePagination(page?: string, limit?: string) {
  const pageNum = page ? parseInt(page, 10) : 1;
  const limitNum = limit ? parseInt(limit, 10) : 20;

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError("Page must be a positive integer", {
      page: pageNum,
    });
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ValidationError("Limit must be between 1 and 100", {
      limit: limitNum,
    });
  }

  return { page: pageNum, limit: limitNum };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

export function validateUUID(id: string, fieldName: string = "ID"): string {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`, {
      [fieldName.toLowerCase()]: id,
    });
  }

  return id;
}
