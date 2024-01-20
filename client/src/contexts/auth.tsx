import React, {createContext, useCallback, useContext, useState} from 'react';
import {
	INVITE_PASSWORD_URL,
	INVITE_VERIFY_URL,
	REFRESH_URL,
	REGISTER_URL,
	SIGNIN_URL,
} from '../constants/urls';
import useLocalStorage from '../hooks/useLocalStorage';
import {getHeaders, IUser} from './users';

export interface ISignin {
	email: string;
	password: string;
}

export interface IRegister extends ISignin {
	name: string;
}

export interface IAuth extends IUser {
	access: string;
	refresh: string;
}

export type IError = {
	msg: string;
};

interface IInviteVerify {
	email?: string;
	msg?: string;
}

export interface IAuthContext {
	auth: IAuth | null;
	loading: boolean;
	signin: (user: ISignin) => Promise<IError | void>;
	register: (user: IRegister) => Promise<IError | void>;
	refresh: () => Promise<IError | void>;
	signout: () => void;
	verifyInvitation: (inviteToken: string) => Promise<IInviteVerify>;
	invitePassword: (user: ISignin) => Promise<IError | void>;
}

const AuthContext = createContext<IAuthContext | null>(null);

export const useAuth = () => {
	return useContext(AuthContext) as IAuthContext;
};

const AuthProvider: React.FC<React.PropsWithChildren> = ({children}) => {
	const [auth, setAuth] = useLocalStorage<IAuthContext['auth']>('auth', null);
	const [loading, setLoading] = useState(false);

	const signin: IAuthContext['signin'] = useCallback(
		async (user) => {
			try {
				setLoading(true);
				const res = await fetch(SIGNIN_URL, {
					method: 'POST',
					body: JSON.stringify(user),
					headers: getHeaders(auth?.access),
				});
				if (res.status === 200) setAuth((await res.json()).data);
				setLoading(false);
				if (res.status === 400) return await res.json();
			} catch (err) {
				setLoading(false);
				return {
					msg: (err as Error).message,
				};
			}
		},
		[SIGNIN_URL]
	);

	const register: IAuthContext['register'] = useCallback(
		async (user) => {
			try {
				setLoading(true);
				const res = await fetch(REGISTER_URL, {
					method: 'POST',
					body: JSON.stringify(user),
					headers: getHeaders(auth?.access),
				});
				if (res.status === 201) {
					setLoading(false);
					signin({email: user.email, password: user.password});
				}
				setLoading(false);
				if (res.status === 400) return await res.json();
			} catch (err) {
				setLoading(false);
				return {
					msg: (err as Error).message,
				};
			}
		},
		[REGISTER_URL]
	);

	const refresh = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch(REFRESH_URL, {
				method: 'POST',
				body: JSON.stringify({refresh: auth?.refresh}),
				headers: getHeaders(auth?.access),
			});
			if (res.status === 200) {
				let {data} = await res.json();
				setAuth((prev) => {
					prev = prev as IAuth;
					prev.access = data.access;
					prev.refresh = data.refresh;
					return prev;
				});
			}
			setLoading(false);
			if (res.status === 400) {
				setAuth(null);
				return {
					msg: 'Session Expired! Please Signin Again',
				};
			}
		} catch (err) {
			setLoading(false);
			return {msg: (err as Error).message};
		}
	}, [REFRESH_URL]);

	const signout = useCallback(() => {
		setAuth(null);
	}, []);

	const verifyInvitation: IAuthContext['verifyInvitation'] = useCallback(
		async (inviteToken) => {
			try {
				setLoading(true);
				const res = await fetch(INVITE_VERIFY_URL, {
					method: 'POST',
					body: JSON.stringify({inviteToken}),
					headers: getHeaders(auth?.access),
				});

				if (res.status === 200) {
					setLoading(false);
					return await res.json();
				}

				else if (res.status === 400) {
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
		[INVITE_VERIFY_URL]
	);

	const invitePassword: IAuthContext['invitePassword'] = useCallback(
		async (user) => {
			try {
				setLoading(true);
				const res = await fetch(INVITE_PASSWORD_URL, {
					method: 'POST',
					body: JSON.stringify(user),
					headers: getHeaders(auth?.access),
				});
				if (res.status === 200) setAuth((await res.json()));
				setLoading(false);
				if (res.status === 400) return await res.json();
			} catch (err) {
				setLoading(false);
				return {
					msg: (err as Error).message,
				};
			}
		},
		[INVITE_PASSWORD_URL]
	);

	return (
		<>
			<AuthContext.Provider
				value={{
					auth: auth ? {...auth} : auth,
					signin,
					register,
					signout,
					refresh,
					loading,
					verifyInvitation,
					invitePassword
				}}
			>
				{children}
			</AuthContext.Provider>
		</>
	);
};

export default React.memo(AuthProvider);
