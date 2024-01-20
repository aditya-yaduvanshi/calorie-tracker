import React from 'react';
import {useAuth} from '../contexts/auth';
import {Outlet, Navigate, useLocation} from 'react-router-dom';

const PrivateOutlet = () => {
	const {auth} = useAuth();
	const {pathname, hash} = useLocation();
	return auth ? (
		<Outlet />
	) : (
		<Navigate
			to={`/signin?redirect=${pathname + hash}`}
			state={{redirect: pathname + hash}}
		/>
	);
};

export default React.memo(PrivateOutlet);
