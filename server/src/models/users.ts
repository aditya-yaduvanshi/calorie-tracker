import {
	Schema,
	Document,
	model,
	CallbackWithoutResultAndOptionalError,
} from 'mongoose';

export interface IUser {
	name: string;
	email: string;
	password: string;
	role: 'admin' | 'general';
}

export interface IUserSchema extends IUser, Document {
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<IUserSchema>(
	{
		name: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 64,
		},
		email: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 64,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			required: true,
			default: 'general',
		},
	},
	{timestamps: true}
);

UserSchema.pre(
	'validate',
	function (next: CallbackWithoutResultAndOptionalError) {
		if (this.email === 'admin@caler.com') this.role = 'admin';
		next();
	}
);

const Users = model('users', UserSchema);

export default Users;
