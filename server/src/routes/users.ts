import {Router, Response} from 'express';
import {IRequest, isAdmin} from '../middlewares/auth';
import {EntryAnalytics, IEntryAnalyticsSchema} from '../models/entries';
import Users, {IUser} from '../models/users';
import Validator from '../utils/validator';
import Verifier, {IJwtPayload} from '../utils/verifier';

const router = Router();

router
	.route('/')
	.get(isAdmin, async (req: IRequest, res: Response) => {
		try {
			const user = req.user as IJwtPayload;

			const users = await Users.find({}, '-password')
				.where('_id')
				.ne(user._id);

			return res.status(200).json(users);
		} catch (err) {
			return res.status(400).json({msg: (err as Error).message});
		}
	})
	.post(isAdmin, async (req: IRequest, res: Response) => {
		try {
			const body = req.body as IUser;
			if (!body.name || !body.password || !body.email || !body.role)
				return res.status(400).json({
					error: 1,
					msg: 'All fields are required and cannot be empty!',
				});

			if (
				!Validator.isName(body.name) ||
				!Validator.isEmail(body.email) ||
				!Validator.isPassword(body.password) ||
				!Validator.isRole(body.role)
			)
				return res
					.status(400)
					.json({error: 1, msg: 'Invalid name, email, password or role!'});

			let user = await Users.findOne({email: body.email});
			if (user)
				return res.status(400).json({error: 1, msg: 'Email already exists!'});

			user = new Users({
				name: body.name,
				email: body.email,
				role: body.role,
				password: await Verifier.createHash(body.password),
			});

			let userAnalytics;

			if (user.role !== 'admin')
				userAnalytics = new EntryAnalytics({
					user: user._id,
					calories: [
						{
							date: new Date(),
							totalCalorie: 0,
							numOfEntries: 0
						},
					],
					prices: [
						{
							date: new Date(),
							price: 0,
						},
					],
				});

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

router
	.route('/:_id')
	.put(async (req: IRequest, res: Response) => {
		try {
			let {
				user,
				params: {_id},
				body,
			} = req;
			user = user as IJwtPayload;
			body = body as Partial<IUser>;

			if (
				!body.name &&
				!body.email &&
				!body.password &&
				user.role === 'admin' &&
				!body.role
			)
				return res.status(400).json({msg: 'Body should not be empty!'});
			if (body.name && !Validator.isName(body.name))
				return res.status(400).json({msg: 'Invalid name!'});
			if (body.email && !Validator.isEmail(body.email))
				return res.status(400).json({msg: 'Invalid email!'});
			if (body.password && !Validator.isPassword(body.password))
				return res.status(400).json({msg: 'Invalid password!'});
			if (user.role === 'admin' && body.role && !Validator.isRole(body.role))
				return res.status(400).json({msg: 'Invalid role!'});

			let userObj = await Users.findById(_id);
			if (!userObj)
				return res
					.status(400)
					.json({
						msg: "User with the given id didn't exists or might be deleted!",
					});

			if (body.email) {
				if (await Users.exists({email: body.email}))
					return res
						.status(400)
						.json({
							msg: 'Email you have entered is already associated with another user!',
						});
				userObj.email = body.email;
			}

			if (body.name) userObj.name = body.name;
			if (user.role === 'admin' && body.role) userObj.role = body.role;
			if (body.password)
				userObj.password = await Verifier.createHash(body.password);

			await userObj.save();
			return res.status(200).json({
				name: userObj.name,
				email: userObj.email,
				role: userObj.role,
				_id: userObj.role,
				createdAt: userObj.createdAt,
				updatedAt: userObj.updatedAt,
			});
		} catch (err) {
			return res.status(400).json({msg: (err as Error).message});
		}
	})
	.delete(async (req: IRequest, res: Response) => {
		try {
			const user = req.user as IJwtPayload;
			const {_id} = req.params;

			if (user.role === 'admin') await Users.findByIdAndDelete(_id);
			else await Users.findOneAndDelete({_id, user: user._id});

			return res.sendStatus(204);
		} catch (err) {
			return res.status(400).json({error: 1, msg: (err as Error).message});
		}
	});

export default router;
