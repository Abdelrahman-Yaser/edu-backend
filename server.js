import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';
import cors from 'cors';
import { Credentials } from './config/corsOptions.js';
import cookieParser from 'cookie-parser';
import { rootRouter } from './routes/root.js'; // Root router
import userRouter from './routes/authRouter/authRouters.js'; // Authentication router
import postRouter from './routes/postRout/postRouter.js';
import courseRouter from './routes/coursesRouter/courseRouter.js'; // Course router
import articalRouter from './routes/Articales/articalRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Middleware
app.use(cors(Credentials)); // Ensure Credentials is a valid CORS configuration
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/', rootRouter);
app.use('/auth',userRouter ); // Authentication routes
app.use('/posts', postRouter); // Post-related routes postRouter
app.use('/courses',courseRouter ); // Post-related routes
app.use('/articales',articalRouter ); // Post-related routes


// MongoDB connection events ..
mongoose.connection.once('open', () => {
    console.log('MongoDB connection established');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
mongoose.connection.on('error', (err) => {
    console.log('MongoDB connection error: ', err);
});
