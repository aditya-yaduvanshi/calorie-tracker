import React, {useEffect, useState} from 'react';
import {Alert, Button, Spinner} from 'react-bootstrap';
import {Navigate} from 'react-router-dom';
import EntryFilter from '../components/EntryFilter';
import EntryForm, {EntryFormProps} from '../components/EntryForm';
import EntryList from '../components/EntryList';
import PageHeader from '../components/PageHeader';
import UserForm from '../components/UserForm';
import {useAuth} from '../contexts/auth';
import {IEntry, useEntries} from '../contexts/entries';
import UsersProvider from '../contexts/users';

const Home: React.FC = () => {
	const {auth} = useAuth();

	if (auth?.role === 'admin') return <Navigate to='/dashboard' />;

	const {entries, getEntries, warningData} = useEntries();

	const [userFormModel, setUserFormModel] = useState(false);
	const [entryFormModel, setEntryFormModel] = useState(false);
	const [entryFormMode, setEntryFormMode] = useState<EntryFormProps['mode']>({
		edit: false,
		entry: null,
	});

	const handleEdit = (entry: IEntry) => {
		setEntryFormMode({edit: true, entry});
		setEntryFormModel(true);
	};

	useEffect(() => {
		if (entries.length) return;
		getEntries();
	}, []);

	return (
		<>
			<PageHeader heading='Food Entries'>
				<Button variant='primary' onClick={() => setEntryFormModel(true)}>
					New Entry
				</Button>
				<Button variant='warning' onClick={() => setUserFormModel(true)}>
					Invite
				</Button>
				<EntryFilter />
			</PageHeader>
			{warningData.calorieCountToday >= 100 && (
				<Alert variant='warning' className='my-2'>
					Your daily calories intake values are exceeded. Total Calories Taken
					Today = {warningData.calorieCountToday}
				</Alert>
			)}
			{warningData.priceSpentToday >= 100 && (
				<Alert variant='warning' className='my-2'>
					Your daily price spent are exceeded. Total Price Spent Today =
					Rs. {warningData.priceSpentToday}
				</Alert>
			)}
			<EntryList entries={entries} onEdit={handleEdit} />
			<UsersProvider>
				<EntryForm
					mode={entryFormMode}
					open={entryFormModel}
					onClose={() => {
						setEntryFormModel(false);
						setEntryFormMode({edit: false, entry: null});
					}}
				/>
				<UserForm
					mode={{edit: false, user: null}}
					open={userFormModel}
					onClose={() => setUserFormModel(false)}
					invite
				/>
			</UsersProvider>
		</>
	);
};

export default React.memo(Home);
