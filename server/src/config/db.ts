import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {Express} from 'express';

dotenv.config();

const PORT = process.env.PORT || 5000;
const DATABASE_URL = `${process.env.DATABASE_URL}`;

async function dbConnect(app: Express) {
	mongoose
		.connect(DATABASE_URL)
		.then((_) => {
			app.listen(PORT, () => console.log('[server]: listening on:', PORT));
		})
		.catch((err: Error) => {
			console.error('DB ERROR:', err.message);
			process.exit(1);
		});
}

export default dbConnect;
