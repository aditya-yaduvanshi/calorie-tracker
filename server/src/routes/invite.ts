import {Router} from 'express';
import {isAuth} from '../middlewares/auth';
import {EntryAnalytics} from '../models/entries';
import Users from '../models/users';
import Validator from '../utils/validator';
import Verifier from '../utils/verifier';
import {ISignin} from './auth';

const router = Router();

interface IInvite {
	name: string;
	email: string;
}

interface IPassword {
	password: string;
}

router.post('/', isAuth, async (req, res) => {
	try {
		const body = req.body as IInvite;
		if (!body.email || !body.name)
			return res
				.status(400)
				.json({msg: 'All fields are required and cannot be empty!'});

		if (!Validator.isName(body.name))
			return res.status(400).json({msg: 'Invalid Name!'});
		if (!Validator.isEmail(body.email))
			return res.status(400).json({msg: 'Invalid Email!'});

		const inviteToken = await Verifier.createInviteToken({
			name: body.name,
			email: body.email,
		});
		return res.status(200).json({inviteToken});
	} catch (err) {
		return res.status(400).json({msg: (err as Error).message});
	}
});

router.post('/verify', async (req, res) => {
	try {
		const body = req.body;
		if (!body.inviteToken)
			return res.status(400).json({msg: 'Invite Token is required!'});

		const invitePayload = await Verifier.verifyInviteToken(body.inviteToken);
		if (!invitePayload)
			return res.status(400).json({msg: 'Invalid Invite Token!'});

		const user = new Users({
			name: invitePayload.name,
			email: invitePayload.email,
			password: invitePayload.name, // temporary password
		});

		const analytics = new EntryAnalytics({
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
		await Promise.all([user.save(), analytics.save()]);
		return res.status(200).json({email: user.email});
	} catch (err) {
		return res.status(400).json({msg: (err as Error).message});
	}
});

router.post('/password', async (req, res) => {
	try {
		const body = req.body as ISignin;
		if (!body.email || !body.password)
			return res.status(400).json({msg: 'Password is required!'});

		if (!Validator.isPassword(body.password))
			return res.status(400).json({
				msg: 'Password should contain atleat 1 A-Z 1 a-z 1 0-9 and 1 special characters of min length 6.',
			});

		let user = await Users.findOne({email: body.email});
		if (!user) return res.status(400).json({msg: "Email did't exists!"});

		user.password = await Verifier.createHash(body.password);

		let payload = {
			name: user.name,
			_id: user._id,
			email: user.email,
			role: user.role,
		};

		const [_user, access, refresh] = await Promise.all([
			user.save(),
			Verifier.createAccess(payload),
			Verifier.createRefresh(payload),
		]);

		return res.status(200).json({...payload, access, refresh});
	} catch (err) {
		return res.status(400).json({msg: (err as Error).message});
	}
});

export default router;
