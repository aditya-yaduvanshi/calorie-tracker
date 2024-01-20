import React, {
	PropsWithChildren,
	useCallback,
	useContext,
	createContext,
	useState,
} from 'react';
import {ENTRIES_URL} from '../constants/urls';
import {IError, useAuth} from './auth';
import {getHeaders} from './users';

export interface IEntry {
	_id: string;
	name: string;
	calorie: number;
	price: number;
	time: string;
	date: Date;
	user: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IEntryQuery {
	fromDate?: string;
	toDate?: string;
	onDate?: string;
}

export interface IEntriesContext {
	entries: IEntry[];
	warningData: {
		calorieCountToday: number;
		priceSpentToday: number;
	};
	getEntries: (query?: IEntryQuery) => Promise<void | IError>;
	addEntry: (
		entry: Omit<IEntry, '_id' | 'createdAt' | 'updatedAt'>
	) => Promise<void | IError>;
	updateEntry: (
		entryId: IEntry['_id'],
		entry: Partial<IEntry>
	) => Promise<void | IError>;
	deleteEntry: (entryId: IEntry['_id']) => Promise<void | IError>;
	loading: boolean;
}

const EntriesContext = createContext<IEntriesContext | null>(null);

export const useEntries = () => {
	return useContext(EntriesContext) as IEntriesContext;
};

const EntriesProvider: React.FC<PropsWithChildren> = ({children}) => {
	const {auth} = useAuth();
	const [entries, setEntries] = useState<IEntriesContext['entries']>([]);
	const [warningData, setWarningData] = useState<
		IEntriesContext['warningData']
	>({calorieCountToday: 0, priceSpentToday: 0});
	const [loading, setLoading] = useState(false);

	const getEntries: IEntriesContext['getEntries'] = useCallback(
		async (query) => {
			setLoading(true);
			try {
				const res = await fetch(
					`${ENTRIES_URL}?fromDate=${query?.fromDate ?? ''}&toDate=${
						query?.toDate ?? ''
					}&onDate=${query?.onDate ?? ''}`,
					{
						headers: getHeaders(auth?.access),
					}
				);
				switch (res.status) {
					case 200: {
						const result = await res.json();
						setLoading(false);
						setEntries(result.data.entries);
						setWarningData({
							calorieCountToday: result.data.calorieCountToday,
							priceSpentToday: result.data.priceSpentToday,
						});
						return;
					}
					case 400: {
						setLoading(false);
						return await res.json();
					}
					case 401: {
						setLoading(false);
					}
				}
			} catch (err) {
				setLoading(true);
				return {
					msg: (err as Error).message,
				};
			}
		},
		[ENTRIES_URL, getHeaders]
	);

	const addEntry: IEntriesContext['addEntry'] = useCallback(
		async (entry) => {
			try {
				setLoading(true);
				const res = await fetch(ENTRIES_URL, {
					method: 'POST',
					body: JSON.stringify(entry),
					headers: getHeaders(auth?.access),
				});
				if (res.status === 200) {
					let {data} = await res.json();
					setEntries((prev) => [data.entry, ...prev]);
					setWarningData({
						calorieCountToday: data.calorieCountToday,
						priceSpentToday: data.priceSpentToday,
					});
				}
				setLoading(false);
				if (res.status === 400) return await res.json();
			} catch (err) {
				setLoading(false);
				return {
					msg: (err as Error).message,
				};
			}
		},
		[ENTRIES_URL, getHeaders]
	);

	const updateEntry: IEntriesContext['updateEntry'] = useCallback(
		async (entryId, entry) => {
			try {
				setLoading(true);
				const res = await fetch(`${ENTRIES_URL}/${entryId}`, {
					method: 'PUT',
					body: JSON.stringify(entry),
					headers: getHeaders(auth?.access),
				});
				if (res.status === 200) {
					let {data} = await res.json();
					setEntries((prev) => {
						let index = prev.findIndex((e) => e._id === entryId);
						if (index > -1) {
							prev[index] = data.entry;
						} else prev.splice(index, 1);
						return prev;
					});
					setWarningData({
						calorieCountToday: data.calorieCountToday,
						priceSpentToday: data.priceSpentToday,
					});
				}
				setLoading(false);
				if (res.status === 400) {
					return await res.json();
				}
			} catch (err) {
				setLoading(false);
				return {
					msg: (err as Error).message,
				};
			}
		},
		[ENTRIES_URL, getHeaders]
	);

	const deleteEntry: IEntriesContext['deleteEntry'] = useCallback(
		async (entryId) => {
			try {
				setLoading(true);
				const res = await fetch(`${ENTRIES_URL}/${entryId}`, {
					method: 'DELETE',
					headers: getHeaders(auth?.access),
				});
				if (res.status === 204) {
					let entry = entries.find((e) => e._id === entryId) as IEntry;
					setEntries((prev) => prev.filter((e) => e._id !== entryId));

					if (entry && entry.date.toISOString() === new Date().toISOString())
						setWarningData((prev) => ({
							calorieCountToday: prev.calorieCountToday - entry.calorie,
							priceSpentToday: prev.priceSpentToday - entry.price,
						}));
				}
				setLoading(false);
				if (res.status === 400) return await res.json();
			} catch (err) {
				setLoading(false);
				return {
					msg: (err as Error).message,
				};
			}
		},
		[ENTRIES_URL, getHeaders]
	);

	return (
		<>
			<EntriesContext.Provider
				value={{
					entries: [...entries],
					getEntries,
					addEntry,
					updateEntry,
					deleteEntry,
					warningData,
					loading,
				}}
			>
				{children}
			</EntriesContext.Provider>
		</>
	);
};

export default React.memo(EntriesProvider);
