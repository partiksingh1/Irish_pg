import express from 'express';
import { deletePropertyById, findProperties, findPropertyById, listProperty, updateProperty } from '../controllers/property';
import { createInquiry, deleteInquiry, getAllInquiries, updateInquiry } from '../controllers/inquiries';
// import { authenticateJWT } from '../middlewares/auth';


const InquiryRouter = express.Router();

InquiryRouter.post('/property/:id/createInquiry', createInquiry); // Use the function as a handler
InquiryRouter.put('/property/:id/updateInquiry', updateInquiry);
InquiryRouter.delete('/property/:id/deleteInquiry', deleteInquiry);
InquiryRouter.get('/property/inquiry/:id', getAllInquiries);
InquiryRouter.put('/inquiries/:id', getAllInquiries);
export default InquiryRouter;
