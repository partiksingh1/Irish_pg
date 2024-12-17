import express , {Request,Response} from 'express';
import cors from 'cors';
import userRoute from './routes/userRoute';
import listRouter from './routes/properties';
import InquiryRouter from './routes/inquiries';
import FavoriteRouter from './routes/favourite';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get('/',(req: Request,res: Response)=>{
    res.send("welcome to the express server")
})
app.use("/api/v1",userRoute);
app.use("/api/v1",listRouter);
app.use("/api/v1",InquiryRouter);
app.use("/api/v1",FavoriteRouter);
app.listen(port,()=>{
    console.log(`server listinging to port ${port}`);
})

