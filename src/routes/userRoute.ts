import express from 'express';
import { createUser, loginUser, me } from '../controllers/user';

const router = express.Router();

router.post('/signup', createUser); // Use the function as a handler
router.post('/login' , loginUser);
router.get('/user/:id' , me);

export default router;
