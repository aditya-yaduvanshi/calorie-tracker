import React from 'react';
import {Row, Col} from 'react-bootstrap';
import {IEntriesContext, IEntry, useEntries} from '../contexts/entries';
import EntryCard from './EntryCard';

type EntryListProps = {
	entries: IEntriesContext['entries'];
  onEdit: (entry: IEntry) => void;
};

const EntryList: React.FC<EntryListProps> = ({
	entries,
  onEdit
}) => {
  const {deleteEntry} = useEntries();

	return (
		<>
			<Row className='py-4'>
				{entries.length ? (
					entries.map((entry) => (
						<Col xs={6} sm={4} md={4} lg={3} className='p-1' key={entry._id}>
							<EntryCard
								entry={entry}
								onEdit={onEdit}
								onDelete={deleteEntry}
							/>
						</Col>
					))
				) : (
					<h3 className='text-center'>No Entries Found!</h3>
				)}
			</Row>
		</>
	);
};

export default React.memo(EntryList);
