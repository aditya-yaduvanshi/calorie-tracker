import React from 'react';
import {Button, Card} from 'react-bootstrap';
import {IEntry} from '../contexts/entries';

type EntryCardProps = {
	entry: IEntry;
	onEdit: (entry: IEntry) => void;
	onDelete: (entryId: IEntry['_id']) => void;
};

const EntryCard: React.FC<EntryCardProps> = ({entry, onEdit, onDelete}) => {
	return (
		<>
			<Card className='shadow-sm'>
				<Card.Header>
					<Card.Title>{entry.name}</Card.Title>
				</Card.Header>
				<Card.Body>
					<Card.Text className='d-flex justify-content-between'>
						<span>Calories -</span> <strong>{entry.calorie}</strong>
					</Card.Text>
					<Card.Text className='d-flex justify-content-between'>
						<span>Price -</span> <strong>Rs. {entry.price}</strong>
					</Card.Text>
					<Card.Text className='d-flex justify-content-between'>
						<span>Time -</span> <strong>{entry.time}</strong>
					</Card.Text>
					<Card.Text className='d-flex justify-content-between'>
						<span>Date -</span> <strong>{new Date(entry.date).toISOString().split('T')[0]}</strong>
					</Card.Text>
				</Card.Body>
				<Card.Footer style={{display: 'flex', justifyContent: 'space-between'}}>
					<Button variant='primary' onClick={() => onEdit(entry)}>
						Edit
					</Button>
					<Button variant='danger' onClick={() => onDelete(entry._id)}>
						Delete
					</Button>
				</Card.Footer>
			</Card>
		</>
	);
};

export default React.memo(EntryCard);
