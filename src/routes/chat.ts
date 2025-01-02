import express from 'express';
import { createChat, deleteChat, getAllChats, getChatById, sendMessage } from '../controllers/chats';

const ChatRouter = express.Router();

ChatRouter.post('/chats', createChat); // Create a new chat
ChatRouter.get('/chats', getAllChats); // Get all chats for a user
ChatRouter.get('/chats/:id', getChatById); // Get a specific chat by ID
ChatRouter.post('/chats/:id/messages', sendMessage); // Send a message in a chat
ChatRouter.delete('/chats/:id', deleteChat); // Delete a chat

export default ChatRouter;
