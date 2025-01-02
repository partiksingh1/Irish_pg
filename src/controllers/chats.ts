import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { io } from '../utils/socket';


const prisma = new PrismaClient();

// 1. Create a Chat
export const createChat = async (req: Request, res: Response) => {
    const { userIds } = req.body; // Expecting an array of user IDs to create a chat

    try {
        if (!userIds || userIds.length < 2) {
             res.status(400).json({ message: 'At least two user IDs are required to create a chat.' });
             return
        }

        // Create the chat
        const chat = await prisma.chat.create({
            data: {
                id: generateChatId(), // Function to generate a unique chat ID
                users: {
                    create: userIds.map((userId: number) => ({
                        userId,
                    })),
                },
            },
        });

        res.status(201).json({
            message: 'Chat created successfully',
            chat,
        });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({
            message: 'Error creating chat',
            error,
        });
    }
};

// 2. Get All Chats for a User
export const getAllChats = async (req: Request, res: Response) => {
    const userId = parseInt(req.headers['user-id'] as string); // Get authenticated user ID

    try {
        if (!userId) {
             res.status(401).json({ message: 'Unauthorized: user ID is missing' });
             return
        }

        const chats = await prisma.chat.findMany({
            where: {
                users: {
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                users: {
                    include: {
                        user: { // Include user details
                            select: {
                                user_id: true,  // Include user ID
                                first_name: true,  // Include user's first name
                            },
                        },
                    },
                },
                messages: true, // Include related messages
            },
        });

        res.status(200).json({
            message: 'Chats retrieved successfully',
            chats,
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({
            message: 'Error fetching chats',
            error,
        });
    }
};

// 3. Get a Specific Chat by ID
export const getChatById = async (req: Request, res: Response) => {
    const chatId = req.params.id; // Extract chatId from URL

    try {
        const page = parseInt(req.query.page as string || "1");
        const limit = 20;
        const messages = await prisma.message.findMany({
        where: { chatId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
});


        if (!messages) {
             res.status(404).json({ message: 'Chat not found' });
             return
        }

        res.status(200).json({
            message: 'Chat retrieved successfully',
            messages,
        });
    } catch (error) {
        console.error('Error fetching chat:', error);
        res.status(500).json({
            message: 'Error fetching chat',
            error,
        });
    }
};

// 4. Send a Message in a Chat
export const sendMessage = async (req: Request, res: Response) => {
    const { text, userId } = req.body; // Expecting message text and user ID
    const chatId = req.params.id; // Extract chatId from URL

    try {
        if (!text || !userId) {
             res.status(400).json({ message: 'Message text and user ID are required.' });
             return
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                text,
                userId,
                chatId,
            },
        });

        // Emit a new message to the chat using Socket.IO
        io.to(chatId).emit('getMessage', {
            chatId,
            message,
        });

        res.status(201).json({
            messages: 'Message sent successfully',
            message,
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            message: 'Error sending message',
            error,
        });
    }
};

// 5. Delete a Chat
export const deleteChat = async (req: Request, res: Response) => {
    const chatId = req.params.id; // Extract chatId from URL

    try {
        // Check if the chat exists
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
        });

        if (!chat) {
             res.status(404).json({ message: 'Chat not found' });
             return
        }

        // Delete the chat
        await prisma.chat.delete({
            where: { id: chatId },
        });

        res.status(200).json({
            message: 'Chat deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({
            message: 'Error deleting chat',
            error,
        });
    }
};

// Utility function to generate a unique chat ID
const generateChatId = (): string => {
    return 'chat_' + Math.random().toString(36).substr(2, 9); // Simple unique ID generation
};
