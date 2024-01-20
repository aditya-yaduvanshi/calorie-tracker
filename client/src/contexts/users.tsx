import React, {createContext, useCallback, useContext, useState} from 'react';
import {INVITE_URL, INVITE_VERIFY_URL, USERS_URL} from '../constants/urls';
import {IError, IRegister, useAuth} from './auth';

export interface IUser {
	name: string;
	email: string;
	_id: string;
	role: 'admin' | 'general';
}

interface ICreateUser extends IRegister {
	role: IUser['role'];
}

interface IInviteResponse {
	inviteToken?: string;
	msg?: string;
}

export interface IUsersContext {
	users: IUser[];
	loading: boolean;
	getUsers: () => Promise<void | IError>;
	createUser: (user: ICreateUser) => Promise<IError | void>;
	updateUser: (userId: IUser['_id'], user: Partial<ICreateUser>) => Promise<void | IError>;
	deleteUser: (userId: IUser['_id']) => Promise<void | IError>;
	inviteUser: (user: Omit<IRegister, 'password'>) => Promise<void | IInviteResponse>;
}

const UsersContext = createContext<IUsersContext | null>(null);

export const getHeaders = (token?: string) => {
	return {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`,
	}
}

export const useUsers = () => {
	return useContext(UsersContext) as IUsersContext;
};

const UsersProvider: React.FC<React.PropsWithChildren> = ({children}) => {
	const [users, setUsers] = useState<IUsersContext['users']>([]);
	const [loading, setLoading] = useState(false);
	const {auth} = useAuth();

	const getUsers = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch(USERS_URL, {
				headers: getHeaders(auth?.access),
			});
			if (res.status === 200) setUsers(await res.json());
			setLoading(false);
			if (res.status === 401) {
				// refresh
			}
		} catch (err) {
			setLoading(false);
			return {
				msg: (err as Error).message,
			};
		}
	}, [USERS_URL]);

	const createUser: IUsersContext['createUser'] = useCallback(
		async (user) => {
			try {
				setLoading(true);
				const res = await fetch(USERS_URL, {
					method: 'POST',
					body: JSON.stringify(user),
					headers: getHeaders(auth?.access),
				});
				if (res.status === 201) {
					let _id = res.headers.get('Location') as string;
					setUsers((prev) => [{...user, _id}, ...prev]);
					setLoading(false);
				} else if (res.status === 400) {
					setLoading(false);
					return await res.json();
				}
			} catch (err) {
				setLoading(false);
				return {
					msg: (err as Error).message,
				};
			}
		},
		[USERS_URL]
	);

	const updateUser: IUsersContext['updateUser'] = useCallback(async (userId, user) => {
		try {
			const res = await fetch(`${USERS_URL}/${userId}`, {
				method: 'PUT',
				body: JSON.stringify(user),
				headers: getHeaders(auth?.access),
			});
			if(res.status === 200){
				let result = await res.json();
				setUsers(prev => {
					let index = prev.findIndex(usr => usr._id === userId);
					if(index > -1){
						prev[index] = result;
					}
					return prev;
				});
				setLoading(false);
			} else if (res.status === 400){
				setLoading(false);
				return await res.json();
			}
		} catch (err) {
			setLoading(false);
			return {
				msg: (err as Error).message
			}
		}
	}, [USERS_URL]);

	const deleteUser: IUsersContext['deleteUser'] = useCallback(async (userId) => {
		try {
			const res = await fetch(`${USERS_URL}/${userId}`, {
				method: 'DELETE',
				headers: getHeaders(auth?.access),
			});
			if(res.status === 204)
				setUsers(prev => {
					let index = prev.findIndex(user => user._id === userId);
					if(index > -1)
						prev.splice(index, 1);
					return prev;
				});
			setLoading(false);
			if(res.status === 400) return await res.json();
		} catch (err) {
			setLoading(false);
			return {
				msg: (err as Error).message
			}
		}
	}, [USERS_URL]);

	const inviteUser: IUsersContext['inviteUser'] = useCallback(
		async (user) => {
			try {
				setLoading(true);
				const res = await fetch(INVITE_URL, {
					method: 'POST',
					body: JSON.stringify(user),
					headers: getHeaders(auth?.access),
				});
				if (res.status === 200 || res.status === 400) {
					setLoading(false);
					return await res.json();
				}
			} catch (err) {
				return {
					msg: (err as Error).message,
				};
			}
		},
		[INVITE_URL]
	);

	return (
		<>
			<UsersContext.Provider
				value={{
					users,
					loading,
					getUsers,
					createUser,
					updateUser,
					deleteUser,
					inviteUser
				}}
			>
				{children}
			</UsersContext.Provider>
		</>
	);
};

export default React.memo(UsersProvider);
