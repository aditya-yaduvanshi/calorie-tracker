import React, { useState } from 'react';
import {DropdownButton, Form, Button} from 'react-bootstrap';
import { IEntryQuery, useEntries } from '../contexts/entries';

const EntryFilter: React.FC = () => {
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');
	const [onDate, setOnDate] = useState('');

	const {getEntries} = useEntries();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log(fromDate, toDate, onDate)
		if(!fromDate && !toDate && !onDate) return;
		let filter: IEntryQuery = {};
		if(fromDate) 
			filter.fromDate = fromDate;
		if(toDate) 
			filter.toDate = toDate;
		if(onDate) 
			filter.onDate = toDate;
		await getEntries(filter);
	}

	return (
		<>
			<DropdownButton title='Filter'>
				<Form onSubmit={handleSubmit} className='py-2 px-4'>
					<Form.Group className='mb-3'>
						<Form.Label>From Date</Form.Label>
						<Form.Control type='date' value={fromDate} onChange={({target:{value}}) => setFromDate(value)} />
					</Form.Group>
					<Form.Group className='mb-3'>
						<Form.Label>To Date</Form.Label>
						<Form.Control type='date' value={toDate} onChange={({target:{value}}) => setToDate(value)} />
					</Form.Group>
					<Form.Group className='mb-3'>
						<Form.Label>On Date</Form.Label>
						<Form.Control type='date' value={onDate} onChange={({target:{value}}) => setOnDate(value)} />
					</Form.Group>
					<Button type='submit' variant='primary' className='w-100 mt-2'>
						Apply
					</Button>
				</Form>
			</DropdownButton>
		</>
	);
};

export default React.memo(EntryFilter);
