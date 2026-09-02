import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  category: z.string().trim().max(100).optional().or(z.literal("")),
});

// All fields optional for partial updates, but at least one must be present.
export const updateProductSchema = createProductSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update" }
);
