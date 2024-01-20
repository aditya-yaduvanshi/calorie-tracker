import jwt, {JwtPayload} from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {config} from 'dotenv';
import {Types} from 'mongoose';

config();

export interface IJwtPayload extends JwtPayload {
	_id: Types.ObjectId;
	name: string;
	email: string;
	role: 'admin' | 'general';
}

export interface IJwtInvite extends JwtPayload {
	name: string;
	email: string;
}

const {SALT_ROUNDS, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_INVITE_SECRET} = process.env;

class Verifier {
	static async createHash(password: string) {
		return await bcrypt.hash(password, Number(SALT_ROUNDS) || 10);
	}

	static async verifyHash(password: string, hash: string) {
		return await bcrypt.compare(password, hash);
	}

	static async createAccess(user: IJwtPayload) {
		return jwt.sign(user, `${JWT_ACCESS_SECRET}`, {
			expiresIn: '8h',
		});
	}

	static async verifyAccess(access: string) {
		return jwt.verify(access, `${JWT_ACCESS_SECRET}`) as IJwtPayload;
	}

	static async createRefresh(user: IJwtPayload) {
		return jwt.sign(user, `${JWT_REFRESH_SECRET}`);
	}

	static async verifyRefresh(refresh: string) {
		return jwt.verify(refresh, `${JWT_REFRESH_SECRET}`) as IJwtPayload;
	}

	static async createInviteToken(user: IJwtInvite) {
		return jwt.sign(user, `${JWT_INVITE_SECRET}`, {
			expiresIn: '7d',
		});
	}

	static async verifyInviteToken(token: string) {
		return jwt.verify(token, `${JWT_INVITE_SECRET}`) as IJwtInvite;
	}
}

export default Verifier;
