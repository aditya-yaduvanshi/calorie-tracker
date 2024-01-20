import {Request, Response, Router} from 'express';
import {IRequest} from '../middlewares/auth';
import {EntryAnalytics} from '../models/entries';
import Users, {IUser} from '../models/users';
import Validator from '../utils/validator';
import Verifier from '../utils/verifier';

const router = Router();

interface IRefresh {
	refresh: string;
}

export interface ISignin extends Omit<IUser, 'role' | 'name'> {}

router.post('/signin', async (req: Request, res: Response) => {
	try {
		const body = req.body as ISignin;

		if (!body.email || !body.password)
			return res
				.status(400)
				.json({error: 1, msg: 'All fields are required and cannot be empty!'});

		if (!Validator.isEmail(body.email) && !Validator.isPassword(body.password))
			return res
				.status(400)
				.json({error: 1, msg: 'Invalid email or password!'});

		let user = await Users.findOne({email: body.email}).select({
			name: 1,
			email: 1,
			password: 1,
			role: 1,
		});

		if (!user)
			return res.status(400).json({error: 1, msg: 'Email does not exists!'});

		if (!(await Verifier.verifyHash(body.password, user.password)))
			return res.status(400).json({error: 1, msg: 'Incorrect Password!'});

		let jwtPayload = {
			name: user.name,
			email: user.email,
			role: user.role,
			_id: user._id,
		};

		let [access, refresh] = await Promise.all([
			Verifier.createAccess(jwtPayload),
			Verifier.createRefresh(jwtPayload),
		]);

		await user.save();
		return res.status(200).json({
			error: 0,
			data: {...jwtPayload, access, refresh},
		});
	} catch (err) {
		console.log(err);
		if ((err as Error).name === 'ValidationError') {
			return res.status(400).json({error: 1, msg: 'Invalid input data!'});
		}
		return res.status(400).json({error: 1, msg: (err as Error).message});
	}
});

router.post('/register', async (req: IRequest, res: Response) => {
	try {
		const body = req.body as IUser;
		if (!body.name || !body.password || !body.email)
			return res
				.status(400)
				.json({error: 1, msg: 'All fields are required and cannot be empty!'});

		if (
			!Validator.isName(body.name) ||
			!Validator.isEmail(body.email) ||
			!Validator.isPassword(body.password)
		)
			return res
				.status(400)
				.json({error: 1, msg: 'Invalid name, email or password!'});

		let user = await Users.findOne({email: body.email});
		if (user)
			return res.status(400).json({error: 1, msg: 'Email already exists!'});

		user = new Users({
			name: body.name,
			email: body.email,
			password: await Verifier.createHash(body.password),
		});

		let userAnalytics;

		if (user.role !== 'admin') {
			userAnalytics = new EntryAnalytics({
				user: user._id,
				calories: [
					{
						date: new Date(),
						totalCalorie: 0,
						numOfEntries: 0,
					},
				],
				prices: [
					{
						date: new Date(),
						price: 0,
					},
				],
			});
		}

		await Promise.all([user.save(), userAnalytics?.save()]);
		res.setHeader('Location', user._id);
		return res.sendStatus(201);
	} catch (err) {
		console.log(err);
		if ((err as Error).name === 'ValidationError') {
			return res.status(400).json({error: 1, msg: 'Invalid input data!'});
		}
		return res.status(400).json({error: 1, msg: (err as Error).message});
	}
});

router.post('/refresh', async (req: Request, res: Response) => {
	try {
		const body = req.body as IRefresh;

		if (!body.refresh)
			return res
				.status(400)
				.json({error: 1, msg: 'Refresh Token Was Not Provided!'});

		let jwtPayload = await Verifier.verifyRefresh(body.refresh);

		if (!jwtPayload)
			return res.status(400).json({error: 1, msg: 'Invalid Token!'});

		let validUser = await Users.findOne({email: jwtPayload.email});
		if (!validUser)
			return res.status(400).json({error: 1, msg: 'Not a valid user!'});

		jwtPayload = {
			name: jwtPayload.name,
			email: jwtPayload.email,
			_id: jwtPayload._id,
			role: jwtPayload.role,
		};

		const [access, refresh] = await Promise.all([
			Verifier.createAccess(jwtPayload),
			Verifier.createRefresh(jwtPayload),
		]);

		return res
			.status(200)
			.json({error: 0, msg: 'Token Refreshed!', data: {access, refresh}});
	} catch (err) {
		console.log(err);
		return res.status(400).json({error: 1, msg: (err as Error).message});
	}
});

export default router;
