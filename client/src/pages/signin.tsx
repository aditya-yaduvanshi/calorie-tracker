import React, {useEffect, useState} from 'react';
import {
	Container,
	Row,
	Col,
	Form,
	Button,
	Alert,
	Spinner,
} from 'react-bootstrap';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/auth';

const Signin: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);

	const {signin, auth, loading} = useAuth();
	const {state} = useLocation();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!email || !password) return;
		let err = await signin({email, password});
		if (err) setError(err.msg);
	};

	useEffect(() => {
		if (!auth) return;
		if (state) navigate(state.redirect);
		else navigate(auth.role === 'admin' ? '/dashboard' : '/');
	}, [auth]);

	return (
		<>
			<Container>
				<Row className='justify-content-center'>
					<Col xs={10} sm={8} md={6} lg={4} className='border p-3 mt-5 rounded'>
						<h1 className='text-center'>Sign In</h1>
						<Form onSubmit={handleSubmit}>
							<Form.Group className='my-2'>
								<Form.Label>What's Your Email ?</Form.Label>
								<Form.Control
									type='email'
									placeholder='Email'
									required
									value={email}
									onChange={({target: {value}}) => setEmail(value)}
								/>
							</Form.Group>
							<Form.Group className='mt-2 mb-3'>
								<Form.Label>What's Your Password ?</Form.Label>
								<Form.Control
									type='password'
									placeholder='Password'
									required
									value={password}
									onChange={({target: {value}}) => setPassword(value)}
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

export default React.memo(Signin);
