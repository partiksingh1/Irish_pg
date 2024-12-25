import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. Create a Favorite
export const createFavorite = async (req: Request, res: Response) => {
    const id = req.body?.user_id; // Get authenticated user ID
    const userId = parseInt(id);
    const propertyId = parseInt(req.params.id); // Extract propertyId from URL
  
    try {
      if (!userId) {
         res.status(401).json({ message: 'Unauthorized: user ID is missing' });
         return
      }
  
      // Check if the property exists
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });
  
      if (!property) {
         res.status(404).json({ message: 'Property not found' });
         return
      }
  
      // Check if the user has already favorited the property
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId: userId,
            propertyId: propertyId,
          },
        },
      });
  
      if (existingFavorite) {
         res.status(400).json({ message: 'Property already added to favorites' });
         return
      }
  
      // Create the favorite
      const favorite = await prisma.favorite.create({
        data: {
          userId,
          propertyId,
        },
      });
  
       res.status(201).json({
        message: 'Property added to favorites',
        favorite,
      });
      return
    } catch (error) {
      console.error('Error creating favorite:', error);
       res.status(500).json({
        message: 'Error adding property to favorites',
        error,
      });
      return
    }
  };
  
  // 2. Get All Favorites for a User
  export const getAllFavorites = async (req: Request, res: Response) => {
    const userId = parseInt(req.headers['user-id'] as string);// Get authenticated user ID
  
    try {
      if (!userId) {
       res.status(401).json({ message: 'Unauthorized: user ID is missing' });
       return
      }
  
      const favorites = await prisma.favorite.findMany({
        where: { userId: userId },
        include: {
          property: true, // Include related property data
        },
      });
  
      res.status(200).json({
        message: 'Favorites retrieved successfully',
        favorites,
      });
      return
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({
        message: 'Error fetching favorites',
        error,
      });
      return
    }
  };
  
  // 3. Get a Specific Favorite by ID
  export const getFavoriteById = async (req: Request, res: Response) => {
    const favoriteId = parseInt(req.params.id); // Extract favoriteId from URL
  
    try {
      const favorite = await prisma.favorite.findUnique({
        where: { id: favoriteId },
        include: {
          property: true, // Include related property data
        },
      });
  
      if (!favorite) {
        res.status(404).json({ message: 'Favorite not found' });
        return
      }
  
       res.status(200).json({
        message: 'Favorite retrieved successfully',
        favorite,
      });
      return
    } catch (error) {
      console.error('Error fetching favorite:', error);
       res.status(500).json({
        message: 'Error fetching favorite',
        error,
      });
      return
    }
  };
  
  // 4. Delete Favorite by ID
  export const deleteFavorite = async (req: Request, res: Response) => {
    const id = req.body?.user_id; // Get authenticated user ID
    const userId = parseInt(id);
    const favoriteId = parseInt(req.params.id); // Extract favoriteId from URL
  
    try {
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized: user ID is missing' });
        return
      }
  
      // Check if the favorite exists
      const favorite = await prisma.favorite.findUnique({
        where: { id: favoriteId },
      });
  
      if (!favorite) {
         res.status(404).json({ message: 'Favorite not found' });
         return
      }
  
      // Ensure the favorite belongs to the authenticated user
      if (favorite.userId !== userId) {
         res.status(403).json({ message: 'Forbidden: You can only delete your own favorites' });
         return
      }
  
      // Delete the favorite
      await prisma.favorite.delete({
        where: { id: favoriteId },
      });
  
       res.status(200).json({
        message: 'Favorite removed successfully',
      });
      return
    } catch (error) {
      console.error('Error deleting favorite:', error);
       res.status(500).json({
        message: 'Error removing favorite',
        error,
      });
      return
    }
  };
  