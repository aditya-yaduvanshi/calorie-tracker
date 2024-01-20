import React, {useEffect, useState} from 'react';
import {
	Form,
	Button,
	Modal,
	Dropdown,
	DropdownButton,
	Alert,
	Spinner,
} from 'react-bootstrap';
import {useAuth} from '../contexts/auth';
import entries, {IEntry, useEntries} from '../contexts/entries';
import {useUsers} from '../contexts/users';

export type EntryFormProps = {
	mode: {
		edit: boolean;
		entry: IEntry | null;
	};
	open: boolean;
	onClose: () => void;
};

const EntryForm: React.FC<EntryFormProps> = ({mode, open, onClose}) => {
	const {auth} = useAuth();
	const {users, getUsers} = useUsers();
	const {addEntry, updateEntry, loading} = useEntries();

	const [name, setName] = useState('');
	const [calorie, setCalorie] = useState(0);
	const [price, setPrice] = useState(0);
	const [date, setDate] = useState('');
	const [time, setTime] = useState('');
	const [user, setUser] = useState('');
	const [error, setError] = useState<string | null>(null);

	const clearFields = () => {
		setName('');
		setCalorie(0);
		setPrice(0);
		setTime('');
		setDate('');
		setUser('');
		setError(null);
	};

	useEffect(() => {
		if (!mode.edit || !mode.entry) {
			clearFields();
			return;
		}
		setName(mode.entry.name);
		setCalorie(mode.entry.calorie);
		setPrice(mode.entry.price);
		setTime(mode.entry.time.split(' ')[0]);
		setDate(new Date(mode.entry.date).toISOString().split('T')[0]);
	}, [mode.edit]);

	useEffect(() => {
		if(users.length || auth?.role !== 'admin') return;
		getUsers();
	}, [users]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if(!auth) return;
		let err;
		let body: Omit<IEntry, 'createdAt' | 'updatedAt' | '_id'> = {
			user: auth.role === 'admin' ? user : auth._id,
			name,
			price,
			calorie,
			time,
			date: new Date(date),
		};

		if (mode.edit && mode.entry) {
			err = await updateEntry(mode.entry._id, body);
		} else err = await addEntry(body);
		if (err) return setError(err.msg);
		
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
							{mode.edit && mode.entry ? 'Edit' : 'Create'} Entry
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{auth && auth.role === 'admin' && (
							<Form.Group className='mb-2'>
								<Form.Label>User</Form.Label>
								<DropdownButton title={user ? users.find(u => u._id === user)?.name : 'Select User'}>
									{users.length
										? users.map((usr) => (
												<Dropdown.Item
													onClick={() => setUser(usr._id)}
													key={usr._id}
												>
													{usr.name}
												</Dropdown.Item>
										  ))
										: null}
								</DropdownButton>
							</Form.Group>
						)}
						<Form.Group className='mb-2'>
							<Form.Label>Food Item</Form.Label>
							<Form.Control
								placeholder='Enter food item taken'
								value={name}
								required
								onChange={({target: {value}}) => setName(value)}
							/>
						</Form.Group>
						<Form.Group className='mb-2'>
							<Form.Label>Calorie</Form.Label>
							<Form.Control
								type='number'
								min='0'
								max='5000'
								placeholder='Entry calories taken'
								required
								value={calorie}
								onChange={({target: {value}}) => setCalorie(Number(value))}
							/>
						</Form.Group>
						<Form.Group className='mb-2'>
							<Form.Label>Price</Form.Label>
							<Form.Control
								type='number'
								min='0'
								max='99999999'
								placeholder='Entry food price'
								required
								value={price}
								onChange={({target: {value}}) => setPrice(Number(value))}
							/>
						</Form.Group>
						<Form.Group className='mb-2'>
							<Form.Label>Time</Form.Label>
							<Form.Control
								type='time'
								placeholder='Entry time of food taken'
								required
								value={time}
								onChange={({target: {value}}) => setTime(value)}
							/>
						</Form.Group>
						<Form.Group className='mb-3'>
							<Form.Label>Date</Form.Label>
							<Form.Control
								type='date'
								placeholder='Entry date of food taken'
								required
								value={date}
								onChange={({target: {value}}) => setDate(value)}
							/>
						</Form.Group>

						{error && <Alert variant='danger'>{error}</Alert>}
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
							{mode.edit && mode.entry ? 'Save' : 'Create'} Entry
							{loading && <Spinner size='sm' animation='border'></Spinner>}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
};

export default React.memo(EntryForm);
