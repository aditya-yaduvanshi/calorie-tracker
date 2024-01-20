import React, { useEffect, useState } from 'react';
import {Button, Col, Row} from 'react-bootstrap';
import PageHeader from '../components/PageHeader';
import UserCard from '../components/UserCard';
import UserForm, { UserFormProps } from '../components/UserForm';
import { IUser, useUsers } from '../contexts/users';

const Users = () => {
	const {users, deleteUser, getUsers} = useUsers();
	const [userFormModel, setUserFormModel] = useState(false);
	const [userFormMode, setUserFormMode] = useState<UserFormProps['mode']>({
		edit: false,
		user: null,
	});

	const handleEdit = (user: IUser) => {
		setUserFormMode({edit: true, user});
		setUserFormModel(true);
	};

	useEffect(() => {
		if(users.length) return;
		getUsers();
	}, [users]);

	return (
		<>
			<PageHeader heading='Users'>
				<Button variant='primary' onClick={() => setUserFormModel(true)}>
					New User
				</Button>
			</PageHeader>
			<Row className='py-4'>
				{users.length ? users.map(user => (
					<Col xs={6} sm={4} md={4} lg={3} className='p-1' key={user._id}>
						<UserCard user={user} onEdit={handleEdit} onDelete={deleteUser} />
					</Col>
				)) : <h3 className='text-center'>No Users Found!</h3>}
			</Row>
			<UserForm open={userFormModel} onClose={() => {
				setUserFormModel(false);
				setUserFormMode({edit: false, user: null});
			}} mode={userFormMode} />
		</>
	);
};

export default React.memo(Users);
