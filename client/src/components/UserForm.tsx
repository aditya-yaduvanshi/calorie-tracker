import React, {useState, useEffect} from 'react';
import {Form, Button, Modal, Alert, Spinner} from 'react-bootstrap';
import {useAuth} from '../contexts/auth';
import {IUser, useUsers} from '../contexts/users';
import InviteAlert from './InviteAlert';

export type UserFormProps = {
	mode: {
		edit: boolean;
		user: IUser | null;
	};
	invite?: boolean;
	open: boolean;
	onClose: () => void;
};

const UserForm: React.FC<UserFormProps> = ({mode, open, onClose, invite}) => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [password2, setPassword2] = useState('');
	const [role, setRole] = useState<IUser['role']>('general');
	const [error, setError] = useState<string | null>(null);
	const [inviteToken, setInviteToken] = useState('');

	const {auth} = useAuth();
	const {loading, createUser, updateUser, inviteUser} = useUsers();

	useEffect(() => {
		if (!mode.edit || !mode.user) return;
		setName(mode.user.name);
		setEmail(mode.user.email);
		setRole(mode.user.role);
	}, [mode.edit, mode.user]);

	const clearFields = () => {
		setName('');
		setEmail('');
		setPassword('');
		setPassword2('');
		setRole('general');
		setError(null);
		setInviteToken('');
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');

		if (invite) {
			let res = await inviteUser({name, email});
			if (res) {
				if (res.msg) return setError(res.msg);
				else return setInviteToken(res.inviteToken ?? '');
			}
		} else {
			if (password !== password2)
				return setError('Passwords are not matching!');
			let err;
			if (mode.edit && mode.user) {
				err = await updateUser(mode.user._id, {name, email, password});
			} else err = await createUser({name, email, password, role});
			if (err) setError(err.msg);
		}

		clearFields();
		onClose();
	};

	return (
		<>
			<Modal
				show={open}
				onHide={() => {
					clearFields();
					onClose();
				}}
			>
				<Form onSubmit={handleSubmit}>
					<Modal.Header closeButton>
						<Modal.Title>
							{auth?.role === 'admin' ? 'New User' : 'Invite A Friend'}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{auth?.role === 'admin' && (
							<Form.Group className='mb-2'>
								<Form.Label>Role</Form.Label>
								<Form.Select
									onChange={({target: {value}}) =>
										setRole(value as IUser['role'])
									}
									defaultValue={role}
								>
									<option value='general'>General</option>
									<option value='admin'>Admin</option>
								</Form.Select>
							</Form.Group>
						)}
						<Form.Group className='mb-2'>
							<Form.Label>Name</Form.Label>
							<Form.Control
								placeholder='Full Name'
								minLength={3}
								value={name}
								required
								onChange={({target: {value}}) => setName(value)}
							/>
						</Form.Group>
						<Form.Group className={auth?.role === 'admin' ? 'mb-2' : 'mb-4'}>
							<Form.Label>Email</Form.Label>
							<Form.Control
								placeholder='Email Address'
								type='email'
								value={email}
								required
								onChange={({target: {value}}) => setEmail(value)}
							/>
						</Form.Group>
						{auth?.role === 'admin' && (
							<>
								<Form.Group className='mb-2'>
									<Form.Label>Password</Form.Label>
									<Form.Control
										placeholder='Password'
										type='password'
										value={password}
										minLength={6}
										required={!mode.edit && !mode.user}
										onChange={({target: {value}}) => setPassword(value)}
									/>
								</Form.Group>
								<Form.Group className='mb-4'>
									<Form.Label>Password</Form.Label>
									<Form.Control
										placeholder='Confirm Password'
										type='password'
										value={password2}
										minLength={6}
										required={!mode.edit && !mode.user}
										onChange={({target: {value}}) => setPassword2(value)}
									/>
								</Form.Group>
							</>
						)}
						{error && <Alert variant='danger'>{error}</Alert>}
						{invite && inviteToken ? <InviteAlert inviteToken={inviteToken} /> : null}
					</Modal.Body>
					<Modal.Footer>
						<Button
							variant='secondary'
							onClick={() => {
								clearFields();
								onClose();
							}}
						>
							Close
						</Button>
						<Button variant='primary' type='submit' disabled={loading}>
							Submit
							{loading && <Spinner size='sm' animation='border'></Spinner>}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
};

export default React.memo(UserForm);
