import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { InquirySchema } from '../models/inquiries';
const prisma = new PrismaClient();

export const createInquiry = async (req: Request, res: Response) => {
    // Get the authenticated user's userId from req.user (assumes JWT authentication middleware is used)
    const propertyId = parseInt(req.params.id);  // Extract propertyId from the URL
    const { message } = req.body;  // Extract the message from the request body

    // Validate the request body using Zod schema
    const validation = InquirySchema.safeParse(req.body);

    if (!validation.success) {
         res.status(400).json({
            message: 'Validation failed',
            errors: validation.error.format(),  // Return detailed error messages from Zod
        });
        return
    }

    // Proceed if validation passes
    try {

        // Check if the property exists
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
        });

        if (!property) {
             res.status(404).json({ message: 'Property not found' });
             return
        }

        // Create the inquiry associated with the property and user
        const inquiry = await prisma.inquiry.create({
            data: {
                message,
                status: 'UNREAD', // Default status for a new inquiry
                userId: req.body?.user_id,  // Use the userId from authenticated user
                propertyId,
            },
        });

        // Return the created inquiry
         res.status(201).json({
            message: 'Inquiry created successfully',
            inquiry,
        });
        return
    } catch (error) {
        console.error('Error creating inquiry:', error);
         res.status(500).json({
            message: 'Error creating inquiry',
            error,
        });
        return
    }
};


export const updateInquiry = async (req: Request, res: Response) => {
    const inquiryId = parseInt(req.params.id);  // Extract inquiryId from the URL
    const { message } = req.body;  // Extract the message from the request body
  
    // Validate the request body using Zod schema
    const validation = InquirySchema.safeParse(req.body);
    if (!validation.success) {
       res.status(400).json({
        message: 'Validation failed',
        errors: validation.error.format(),  // Return detailed error messages from Zod
      });
      return
    }
  
    try {
      // Find the inquiry by its ID
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: inquiryId },
      });
  
      if (!inquiry) {
         res.status(404).json({ message: 'Inquiry not found' });
         return
      }
  
    //   // Check if the user is authorized to update the inquiry (should match the user_id from JWT)
    //   if (inquiry.userId !== req.user?.user_id) {
    //     return res.status(403).json({ message: 'Forbidden: You are not authorized to update this inquiry' });
    //   }
  
      // Update the inquiry message
      const updatedInquiry = await prisma.inquiry.update({
        where: { id: inquiryId },
        data: {
          message,  // New message
        },
      });
  
      // Return the updated inquiry
       res.status(200).json({
        message: 'Inquiry updated successfully',
        updatedInquiry,
      });
      return
    } catch (error) {
      console.error('Error updating inquiry:', error);
       res.status(500).json({
        message: 'Error updating inquiry',
        error,
      });
      return
    }
};


  export const deleteInquiry = async (req: Request, res: Response) => {
    const inquiryId = parseInt(req.params.id);  // Extract inquiryId from the URL
  
    try {
      // Find the inquiry by its ID
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: inquiryId },
      });
  
      if (!inquiry) {
         res.status(404).json({ message: 'Inquiry not found' });
         return
      }
  
    //   // Check if the user is authorized to delete the inquiry (should match the user_id from JWT)
    //   if (inquiry.userId !== req.user?.user_id) {
    //      res.status(403).json({ message: 'Forbidden: You are not authorized to delete this inquiry' });
    //      return
    //   }
  
      // Delete the inquiry
      await prisma.inquiry.delete({
        where: { id: inquiryId },
      });
  
      // Return a success message
       res.status(200).json({
        message: 'Inquiry deleted successfully',
      });
      return
    } catch (error) {
      console.error('Error deleting inquiry:', error);
       res.status(500).json({
        message: 'Error deleting inquiry',
        error,
      });
      return
    }
};

export const getAllInquiries = async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.id);  // Optionally, get propertyId from params to filter by property
  
    try {
      // If propertyId is provided, get inquiries for that specific property
      let inquiries;
      if (propertyId) {
        inquiries = await prisma.inquiry.findMany({
          where: {
            propertyId: propertyId,  // Filter inquiries by propertyId
          },
          include: {
            property: true,  // You can include related data (optional)
            user: true,      // Include the user who made the inquiry (optional)
          },
        });
      } else {
        // If no propertyId is provided, get all inquiries in the system
        inquiries = await prisma.inquiry.findMany({
          include: {
            property: true,  // Include related property data (optional)
            user: true,      // Include the user who made the inquiry (optional)
          },
        });
      }
  
      if (inquiries.length === 0) {
         res.status(404).json({ message: 'No inquiries found' });
         return
      }
  
      // Return the list of inquiries
       res.status(200).json({
        message: 'Inquiries retrieved successfully',
        inquiries,
      });
      return
    } catch (error) {
      console.error('Error fetching inquiries:', error);
       res.status(500).json({
        message: 'Error fetching inquiries',
        error,
      });
      return
    }
};

export const getInquiryById = async (req: Request, res: Response) => {
    const inquiryId = parseInt(req.params.id);  // Extract inquiryId from the URL
  
    try {
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: inquiryId },
        include: {
          property: true,  // Include the related property data (optional)
          user: true,      // Include the user who made the inquiry (optional)
        },
      });
  
      if (!inquiry) {
         res.status(404).json({ message: 'Inquiry not found' });
         return
      }
  
       res.status(200).json({
        message: 'Inquiry retrieved successfully',
        inquiry,
      });
      return
    } catch (error) {
      console.error('Error fetching inquiry:', error);
       res.status(500).json({
        message: 'Error fetching inquiry',
        error,
      });
      return
    }
};

