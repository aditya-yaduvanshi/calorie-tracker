import {useState, useEffect, useCallback} from 'react';

export const getLocalKey = (key: string) => `caler:${key}`;

const useLocalStorage = <T>(
	key: string,
	initialValue: T
): [value: T, setValue: React.Dispatch<React.SetStateAction<T>>] => {
	const getStoredValue = useCallback(() => {
		let item = localStorage.getItem(getLocalKey(key));
		return item ? JSON.parse(item) : initialValue;
	}, [key, initialValue, getLocalKey]);

	const [value, setValue] = useState<T>(getStoredValue);

	useEffect(() => {
		localStorage.setItem(getLocalKey(key), JSON.stringify(value));
	}, [value, getLocalKey]);

	return [value, setValue];
};

export default useLocalStorage;
