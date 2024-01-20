import React from 'react';
import {useAuth} from '../contexts/auth';
import {Outlet, Navigate} from 'react-router-dom';

const ProtectedOutlet = () => {
	const {auth} = useAuth();
	return auth && auth.role === 'admin' ? <Outlet /> : <Navigate to='/' />;
};

export default React.memo(ProtectedOutlet);
