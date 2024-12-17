import express from 'express';
import { createFavorite, deleteFavorite, getAllFavorites, getFavoriteById } from '../controllers/favourite';

const FavoriteRouter = express.Router();

// Add a property to favorites
FavoriteRouter.post('/favorites/:id',  createFavorite);

// Get all favorites for the authenticated user
FavoriteRouter.get('/favorites',  getAllFavorites);

// Get a specific favorite by its ID
FavoriteRouter.get('/favorites/:id', getFavoriteById);

// Delete a favorite by its ID
FavoriteRouter.delete('/favorites/:id', deleteFavorite);

export default FavoriteRouter;
