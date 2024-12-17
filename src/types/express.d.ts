import * as express from 'express';
import { User } from '@prisma/client';  // If User type is generated from Prisma

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number;
        email: string;
        role: string;
      };
    }
  }
}
