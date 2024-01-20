import React, {useEffect, useState} from 'react';
import {Button, Row} from 'react-bootstrap';
import EntryForm, {EntryFormProps} from '../components/EntryForm';
import EntryList from '../components/EntryList';
import PageHeader from '../components/PageHeader';
import {IEntry, useEntries} from '../contexts/entries';
import UsersProvider from '../contexts/users';

const Entries = () => {
	const {entries, getEntries} = useEntries();
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
		if(entries.length) return;
		getEntries();
	}, []);

	return (
		<>
			<PageHeader heading='Entries'>
				<Button variant='primary' onClick={() => setEntryFormModel(true)}>
					New Entry
				</Button>
			</PageHeader>
			<EntryList entries={entries} onEdit={handleEdit} />
			<UsersProvider>
				<EntryForm
					mode={entryFormMode}
					open={entryFormModel}
					onClose={() => setEntryFormModel(false)}
				/>
			</UsersProvider>
		</>
	);
};

export default React.memo(Entries);
