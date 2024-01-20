import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { IUser } from '../contexts/users';

interface UserCardProps {
	user: IUser;
	onEdit: (user: IUser) => void;
	onDelete: (userId: IUser['_id']) => void;
}

const UserCard: React.FC<UserCardProps> = ({user, onEdit, onDelete}) => {
	return (
		<>
			<Card className='shadow-sm'>
				<Card.Header>
					<Card.Title>{user.name}</Card.Title>
				</Card.Header>
				<Card.Body>
					<Card.Text className='d-flex justify-content-between'>
						<span>Email -</span> <strong>{user.email}</strong>
					</Card.Text>
					<Card.Text className='d-flex justify-content-between'>
						<span>Role -</span> <strong>{user.role}</strong>
					</Card.Text>
				</Card.Body>
				<Card.Footer style={{display: 'flex', justifyContent: 'space-between'}}>
					<Button variant='primary' onClick={() => onEdit(user)}>
						Edit
					</Button>
					<Button variant='danger' onClick={() => onDelete(user._id)}>
						Delete
					</Button>
				</Card.Footer>
			</Card>
		</>
	);
};

export default React.memo(UserCard);
