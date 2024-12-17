// import jwt from 'jsonwebtoken';
// import { Request, Response, NextFunction } from 'express';

// // Middleware to authenticate the JWT token
// export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
//   // Extract token from the Authorization header
//   const token = req.header('Authorization')?.split(' ')[1];

//   if (!token) {
//      res.status(403).json({ message: "Access Denied" });
//      return
//   }

//   // Verify the token and decode the user info
//   jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, decoded: any) => {
//     if (err) {
//        res.status(403).json({ message: "Invalid token" });
//        return
//     }

//     // Attach the user information to the request object
//     req.user = {
//       user_id: decoded.user_id,  // Access user_id from the token
//       email: decoded.email,
//       role: decoded.role,
//     };

//     next();
//   });
// };
