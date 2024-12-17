import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { LoginSchema, UserSchema } from "../models/user";
const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const validation = UserSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      message: "Validation error",
      errors: validation.error.format(),
    });
    return;
  }

  try {
    const {
      first_name,
      last_name,
      email,
      password_hash,
      role,
      phone_number,
      address,
      profile_picture,
    } = validation.data;

    // Convert role to uppercase to match the enum in Prisma
    const normalizedRole = role.toUpperCase() as 'BUYER' | 'SELLER' | 'ADMIN';

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password_hash,
        role: normalizedRole,
        phone_number,
        address,
        profile_picture,
      },
    });

    res.status(201).json({ message: "User created", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user : Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
    // Validate the input data
    const validation = LoginSchema.safeParse(req.body);
  
    if (!validation.success) {
        res.status(400).json({
        message: "Validation error",
        errors: validation.error.format(),
      });
      return
    }
  
    const { email, password } = validation.data;
  
    try {
      // Find the user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      
        if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
        }
  
        // Directly compare the entered password with the stored password
    if (user.password_hash !== password) {
         res.status(401).json({ message: "Invalid password" });
         return
      }
      // Generate a JWT token
      const token = jwt.sign(
        {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || "your-secret-key", // Use a secret key from env variable
        { expiresIn: "2d" } // Token expiration time
      );
  
      // Return the user data and token
    res.status(200).json({
        message: "Login successful",
        token,
        user: {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
        },
      });
      return
    } catch (error) {
      console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error", error });
    return
    }
};

export const me = async (req:Request,res:Response)=> {
    try {
        // Find the user by the ID decoded from the JWT
        const { id } = req.params;
        const user = await prisma.user.findUnique({
          where: { user_id: parseInt(id) },  // `req.user.userId` comes from JWT authentication
          include: {
            properties: true,  // Include the properties related to the user
            inquiries: true,   // Include the inquiries related to the user
          },
        });
    
        // If the user is not found, return a 404 response
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return
        }
    
        // Return the user data
         res.status(200).json(user);
         return
      } catch (error) {
        console.error('Error retrieving user data:', error);
         res.status(500).json({ message: 'Error retrieving user data'});
         return
      }
}

