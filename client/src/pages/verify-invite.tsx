import React, {useEffect, useState} from 'react';
import {Container, Row, Alert, Spinner} from 'react-bootstrap';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useAuth} from '../contexts/auth';

const VerifyInvite: React.FC = () => {
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const {auth, verifyInvitation, loading} = useAuth();
	const navigate = useNavigate();
	const [search] = useSearchParams();

	useEffect(() => {
		if (!auth) return;
		else navigate(auth.role === 'admin' ? '/dashboard' : '/');
	}, [auth]);

	useEffect(() => {
		if (
			search.get('inviteToken') &&
			typeof search.get('inviteToken') === 'string' &&
			`${search.get('inviteToken')}`.length >= 64
		)
			verifyInvitation(`${search.get('inviteToken')}`).then((res) => {
				setSuccess(true);
				if (res.email) {
					setTimeout(() => {
						navigate(`/password?email=${res.email}`, {
							state: {email: res.email},
						});
					}, 3000);
				} else if (res.msg) setError(res.msg);
			});

		else setTimeout(() => {
			navigate('/signin');
		}, 3000);

	}, [search]);

	return (
		<>
			<Container>
				<Row className='justify-content-center align-items-center '>
					{error && <Alert variant='danger'>{error}</Alert>}
					{success && (
						<Alert variant='success'>
							You are registered successfully! Please set your password now!
							<hr />
							Redirecting you to set your password!
						</Alert>
					)}
					{loading && <Spinner animation='border' className='m-5'></Spinner>}
				</Row>
			</Container>
		</>
	);
};

export default React.memo(VerifyInvite);
