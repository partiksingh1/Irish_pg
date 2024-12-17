import z from 'zod'
// Zod schema for property validation
export const PropertySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    price: z.number().positive("Price must be greater than zero"),
    address: z.string().min(1, "Address is required"),
    propertyType: z.enum(["HOUSE", "APARTMENT", "COMMERCIAL", "LAND"]),
    status: z.enum(["AVAILABLE", "SOLD", "RENTED"]),
    numBedrooms: z.number().int().nonnegative("Number of bedrooms must be a non-negative integer"),
    numBathrooms: z.number().int().nonnegative("Number of bathrooms must be a non-negative integer"),
    squareMeters: z.number().positive("Square meters must be greater than zero"),
    yearBuilt: z.number().int().positive("Year built must be a positive integer"),
    latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
    longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
    features: z.any().optional(),
    images: z.array(
      z.object({
        url: z.string().url("Invalid image URL"),
        imageType: z.enum(["MAIN", "GALLERY", "FLOORPLAN"])
      })
    ).optional(),
    userId: z.number().int().positive("User ID must be a positive integer"), // User ID passed in request body
  });