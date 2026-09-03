import { z } from "zod";

/**
 * Validation schema for user registration.
 * Requires name (2+ chars), Gmail email, and strong password (8+ chars with uppercase, lowercase, number, and special character).
 */
export const registerSchema = z.object({
        name: z
                .string()
                .trim().
                min(2, "Name must be at least 2 characters"),
        email: z
                .string()
                .trim()
                .email("Enter a valid email address")
                .endsWith("@gmail.com", "Email must end with @gmail.com"),
        password: z
                .string()
                .min(8, "Password must be at least 8 characters")
                .max(72, "Password is too long")
                .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
                .regex(/[a-z]/, "Password must contain at least one lowercase letter")
                .regex(/[0-9]/, "Password must contain at least one number")
                .regex(
                        /[^A-Za-z0-9]/,
                        "Password must contain at least one special character"
                ),
});

/**
 * Validation schema for user login.
 * Requires valid email and password (minimum 8 characters).
 */
export const loginSchema = z.object({
        email: z
                .string()
                .trim()
                .email("Enter a valid email"),

        password: z
                .string()
                .min(8, "Password is required"),
});

/**
 * Validation schema for profile updates.
 * Requires name (2+ chars) and Gmail email address.
 */
export const updateSchema = z.object({
        name: z.
                string()
                .trim()
                .min(2, "Name must be at least 2 characters"),
        email: z
                .string()
                .trim()
                .email("Enter a valid email address")
                .endsWith("@gmail.com", "Email must end with @gmail.com"),
})