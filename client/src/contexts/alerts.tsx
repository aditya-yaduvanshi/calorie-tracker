import React, {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useState,
} from 'react';
import {AlertProps} from 'react-bootstrap';

export interface IAlert {
	id: number;
	message: string;
	variant: AlertProps['variant'];
}

export interface IAlertContext {
	alerts: IAlert[];
	addAlert: (message: string, variant: AlertProps['variant']) => void;
	removeAlert: (id: number) => void;
}

const AlertContext = createContext<IAlertContext | null>(null);

export const useAlerts = () => {
	return useContext(AlertContext) as IAlertContext;
};

const AlertProvider: React.FC<PropsWithChildren> = ({children}) => {
	const [alerts, setAlerts] = useState<IAlertContext['alerts']>([]);

	const addAlert: IAlertContext['addAlert'] = useCallback(
		(message, variant) => {
			setAlerts((prev) => [
				{id: new Date().getTime(), message, variant},
				...prev,
			]);
		},
		[]
	);

	const removeAlert: IAlertContext['removeAlert'] = useCallback((id) => {
		setAlerts((prev) => prev.filter((alert) => alert.id !== id));
	}, []);

	return (
		<>
			<AlertContext.Provider
				value={{alerts: [...alerts], addAlert, removeAlert}}
			>
				{children}
			</AlertContext.Provider>
		</>
	);
};

export default AlertProvider;
