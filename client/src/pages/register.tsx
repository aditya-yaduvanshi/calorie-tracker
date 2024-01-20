import React, {useEffect, useState, useRef} from 'react';
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

const Register: React.FC = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [password2, setPassword2] = useState('');
	const [error, setError] = useState<string | null>(null);

	const {register, auth, loading} = useAuth();
	const {state} = useLocation();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name || !email || !password || !password2 || password !== password2)
			return;
		let err = await register({name, email, password});
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
						<h1 className='text-center'>Register</h1>
						<Form onSubmit={handleSubmit}>
							<Form.Group className='my-2'>
								<Form.Label>Full Name</Form.Label>
								<Form.Control
									type='text'
									placeholder='Name Surname'
									required
									value={name}
									onChange={({target: {value}}) => setName(value)}
								/>
							</Form.Group>
							<Form.Group className='my-2'>
								<Form.Label>Email</Form.Label>
								<Form.Control
									type='email'
									placeholder='username@example.com'
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
							<Form.Group className='mb-3 mt-2'>
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
								{loading && <Spinner animation='border' size='sm'></Spinner>}
							</Button>
						</Form>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default React.memo(Register);
