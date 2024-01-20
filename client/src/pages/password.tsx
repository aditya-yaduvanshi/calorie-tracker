import React, {useEffect, useState} from 'react';
import {
	Container,
	Row,
	Col,
	Form,
	Alert,
	Button,
	Spinner,
} from 'react-bootstrap';
import {Navigate, useLocation, useSearchParams} from 'react-router-dom';
import {useAuth} from '../contexts/auth';

const Password = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [password2, setPassword2] = useState('');
	const [error, setError] = useState<string | null>(null);

	const {invitePassword, auth, loading} = useAuth();
	const {state} = useLocation();
	const [search] = useSearchParams();

	useEffect(() => {
		if (state.email) setEmail(state.email);
		else if (search.get('email')) setEmail(search.get('email') ?? '');
	}, [search, state]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!email || !password) return;
		if (password !== password2) return setError('Passwords are not matching!');
		let err = await invitePassword({email, password});
		if (err) setError(err.msg);
	};

	if(auth)
		return <Navigate to="/" />;

	return (
		<>
			<Container>
				<Row className='justify-content-center'>
					<Col xs={10} sm={8} md={6} lg={4} className='border p-3 mt-5 rounded'>
						<h1 className='text-center'>Set Password</h1>
						<Form onSubmit={handleSubmit}>
							<Form.Group className='my-2'>
								<Form.Label>Email</Form.Label>
								<Form.Control
									type='email'
									placeholder='Email'
									required
									value={email}
									onChange={({target: {value}}) => setEmail(value)}
								/>
							</Form.Group>
							<Form.Group className='my-2'>
								<Form.Label>Password</Form.Label>
								<Form.Control
									type='password'
									placeholder='Password'
									required
									value={password}
									onChange={({target: {value}}) => setPassword(value)}
								/>
							</Form.Group>
							<Form.Group className='mt-2 mb-3'>
								<Form.Label>Confirm Password</Form.Label>
								<Form.Control
									type='password'
									placeholder='Confirm Password'
									required
									value={password2}
									onChange={({target: {value}}) => setPassword2(value)}
								/>
							</Form.Group>
							{error && <Alert variant='danger'>{error}</Alert>}
							<Button type='submit' className='w-100 mt-3' disabled={loading}>
								Submit
								{loading && <Spinner size='sm' animation='border'></Spinner>}
							</Button>
						</Form>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default React.memo(Password);
