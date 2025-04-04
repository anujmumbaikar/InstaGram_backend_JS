import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors(
    {origin:process.env.CORS_ORIGIN,
    credentials:true,}
));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

import userRouter from './routes/user.routes.js';
import { postRouter } from './routes/post.routes.js';
import { followRouter } from './routes/follow.routes.js';
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/follow', followRouter);

export {app}