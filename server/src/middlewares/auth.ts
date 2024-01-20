import {Request, Response, NextFunction} from 'express';
import Users from '../models/users';
import Verifier, {IJwtPayload} from '../utils/verifier';

export interface IRequest extends Request {
	user?: IJwtPayload;
}

export async function isAuth(req: IRequest, res: Response, next: NextFunction) {
	try {
		const token = req.headers.authorization?.split('Bearer ')[1];

		if (!token)
			return res
				.status(400)
				.json({error: 1, msg: 'Bearer token was not provided!'});

		let user = await Verifier.verifyAccess(token);

		if (!user) return res.status(400).json({error: 1, msg: 'Invalid token!'});

		if (!(await Users.exists({_id: user._id})))
			return res
				.status(400)
				.json({
					error: 1,
					msg: "Token no longer work! User didn't exists any more!",
				});

		req.user = user as IJwtPayload;

		next();
	} catch (err) {
		console.log(err);
		return res.status(401).json({error: 1, msg: (err as Error).message});
	}
}

export async function isAdmin(
	req: IRequest,
	res: Response,
	next: NextFunction
) {
	const user = req.user as IJwtPayload;
	if (user.role !== 'admin') return res.sendStatus(401);

	next();
}
