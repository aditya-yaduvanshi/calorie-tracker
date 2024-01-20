import express from 'express';
import cors from 'cors';
import {json} from 'body-parser';
import dbConnect from './config/db';
import {isAdmin, isAuth} from './middlewares/auth';
import entriesRouter from './routes/entries';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import inviteRouter from './routes/invite';
import reportsRouter from './routes/reports';

const app = express();

app.use(cors());
app.use(json());
app.use(express.urlencoded({extended: true}));

app.use('/api/reports', isAuth, isAdmin, reportsRouter);
app.use('/api/users', isAuth, usersRouter);
app.use('/api/entries', isAuth, entriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/invite', inviteRouter);

dbConnect(app);
