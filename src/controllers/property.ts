import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserSchema } from '../models/user';
import { PropertySchema } from '../models/properties';
const prisma = new PrismaClient();

export const listProperty = async (req: Request, res: Response) => {
    // const userId = req.user?.id; // Assuming user ID is extracted from auth middleware
    // if (!userId) {
    // res.status(401).json({ message: "Unauthorized" });
    // return
    // }
  
    const validation = PropertySchema.safeParse(req.body);
  
    if (!validation.success) {
       res.status(400).json({
        message: "Validation error",
        errors: validation.error.format()
      });
      return
    }
  
    const {
      title,
      description,
      price,
      address,
      propertyType,
      status,
      numBedrooms,
      numBathrooms,
      squareMeters,
      yearBuilt,
      latitude,
      longitude,
      features,
      images,
      userId, // User ID coming from request body
    } = validation.data;
  
    try {
      const property = await prisma.property.create({
        data: {
          title,
          description,
          price,
          address,
          propertyType,
          status,
          numBedrooms,
          numBathrooms,
          squareMeters,
          yearBuilt,
          latitude,
          longitude,
          features,
          user: {
            connect: { user_id: userId } // Associate property with the logged-in user
          },
          images: {
            create: images // Create associated images
          }
        },
        include: {
          images: true
        }
      });
  
       res.status(201).json({
        message: "Property listed successfully",
        property
      });
      return
    } catch (error) {
      console.error("Error listing property:", error);
       res.status(500).json({ message: "Error listing property", error });
       return
    }
};

// Function to find properties based on query parameters
// Function to find properties based on query parameters
export const findProperties = async (req: Request, res: Response) => {
    // Extract query parameters (filters)
    const {
      location,       // address or city to search for
      priceMin,       // minimum price
      priceMax,       // maximum price
      numBedrooms,    // number of bedrooms
      numBathrooms,   // number of bathrooms
      status,         // status of the property (e.g., 'available', 'sold')
      propertyType,   // type of property (e.g., 'house', 'apartment')
      squareMeters,   // minimum square meters
      yearBuilt,      // filter by the year built
      page = '1',     // pagination: page number (default to '1')
      limit = '10',   // pagination: results per page (default to '10')
      latitude,       // optional latitude for proximity search (if using geospatial query)
      longitude,      // optional longitude for proximity search
      radius = 5000,  // optional radius (in meters) for geospatial search (default to 5 km)
    } = req.query;
  
    // Safely convert page and limit to numbers
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
  
    // Ensure they are valid numbers, falling back to defaults if invalid
    const validPage = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    const validLimit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;
  
    const filters: any = {};
  
    // Apply filters based on the query parameters
    if (location) {
      filters.address = {
        contains: location, // String match for address (case-insensitive)
        mode: 'insensitive',
      };
    }
  
    if (priceMin || priceMax) {
      filters.price = {
        gte: priceMin ? parseFloat(priceMin as string) : undefined,
        lte: priceMax ? parseFloat(priceMax as string) : undefined,
      };
    }
  
    if (numBedrooms) {
      filters.numBedrooms = parseInt(numBedrooms as string);
    }
  
    if (numBathrooms) {
      filters.numBathrooms = parseInt(numBathrooms as string);
    }
  
    if (status) {
      filters.status = status;
    }
  
    if (propertyType) {
      filters.propertyType = propertyType;
    }
  
    if (squareMeters) {
      filters.squareMeters = {
        gte: parseInt(squareMeters as string),
      };
    }
  
    if (yearBuilt) {
      filters.yearBuilt = parseInt(yearBuilt as string);
    }
  
    try {
      let properties;
  
      // If latitude and longitude are provided, do geospatial search using Prisma's spatial query
      if (latitude && longitude) {
        // If you're using PostGIS, you can use Prisma's `geography` field and query with geospatial queries.
        // Uncomment and update if you're using geospatial data (PostGIS or other spatial types)
        properties = await prisma.property.findMany({
          where: {
            ...filters,
            location: {
              // Assuming you're using the geography data type for PostGIS
              stDistance: {
                lt: parseInt(radius as string), // Distance in meters
              },
            },
          },
          take: validLimit, // Pagination: limit number of results per page
          skip: (validPage - 1) * validLimit, // Pagination: skip results based on the current page
          include: {
            images: true, // Include images related to properties
          },
        });
      } else {
        // Normal search (non-geospatial), just based on filters
        properties = await prisma.property.findMany({
          where: filters,
          take: validLimit, // Pagination: limit number of results per page
          skip: (validPage - 1) * validLimit, // Pagination: skip results based on the current page
          include: {
            images: true, // Include images related to properties
          },
        });
      }
  
      // Respond with the found properties
      res.status(200).json({
        message: 'Properties found successfully',
        properties,
        page: validPage,
        limit: validLimit,
        totalCount: properties.length, // Optionally, you can send the total number of properties for pagination purposes
      });
  
    } catch (error) {
      console.error('Error finding properties:', error);
      res.status(500).json({ message: 'Error finding properties', error });
    }
};

// Function to update a property based on the provided property ID
export const updateProperty = async (req: Request, res: Response,) => {
    const { id } = req.params;
    const { title, price, description, status, numBedrooms } = req.body; // Only pick the fields you're updating
  
    try {
      // Find the property by ID
      const property = await prisma.property.findUnique({
        where: { id: parseInt(id) },
      });
  
      // Check if the property exists
      if (!property) {
         res.status(404).json({ message: 'Property not found' });
         return
      }
  
      // Create the update data object, only including the fields provided in the request
      const updateData: any = {};
  
      if (title) updateData.title = title;
      if (price) updateData.price = price;
      if (description) updateData.description = description;
      if (status) updateData.status = status;
      if (numBedrooms) updateData.numBedrooms = numBedrooms;
  
      // Update the property with the fields provided
      const updatedProperty = await prisma.property.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          images: true,  // Optional: include related images
        },
      });
  
      // Respond with the updated property
       res.status(200).json({
        message: 'Property updated successfully',
        property: updatedProperty,
      });
      return
    } catch (error) {
      console.error('Error updating property:', error);
       res.status(500).json({
        message: 'Error updating property',
      });
      return
    }
};

export const findPropertyById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Find the property by ID
    const property = await prisma.property.findUnique({
      where: { id: parseInt(id) }, // Ensure the ID is an integer
    });

    // Check if the property exists
    if (!property) {
       res.status(404).json({ message: "Property not found" });
       return
    }

    // Return the found property
     res.status(200).json(property);
     return

  } catch (error) {
    // Handle any unexpected errors
    console.error(error);
     res.status(500).json({ message: "Internal server error" });
     return
  }
};

export const deletePropertyById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Find the property by ID to check if it exists
    const property = await prisma.property.findUnique({
      where: { id: parseInt(id) },
      include: { images: true }, // Include images to check if any exist
    });

    // Check if the property exists
    if (!property) {
       res.status(404).json({ message: "Property not found" });
       return
    }

    // Delete related images first
    if (property.images.length > 0) {
      await prisma.image.deleteMany({
        where: { propertyId: parseInt(id) },
      });
    }

    // Delete the property
    await prisma.property.delete({
      where: { id: parseInt(id) },
    });

    // Return a success response
     res.status(200).json({
      message: "Property deleted successfully",
      propertyId: id,
    });
    return

  } catch (error) {
    console.error('Error deleting property:', error);
     res.status(500).json({
      message: 'Error deleting property',
      error,
    });
    return
  }
};
