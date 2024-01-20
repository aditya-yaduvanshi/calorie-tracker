import React, {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useState,
} from 'react';
import { REPORT_URL } from '../constants/urls';
import { IError, useAuth } from './auth';
import { getHeaders, IUser } from './users';

export interface IReport {
  thisWeekEntries: number;
  lastWeekEntries: number;
  averageCaloriesPerDayPerUser: {
    user: Omit<IUser, 'role'>,
    caloriesPerDay: {
      date: Date;
      calories: number;
    }[];
  }[];
}

export interface IAdminContext {
	report: IReport | null;
	getReport: () => Promise<void | IError>;
}

const AdminContext = createContext<IAdminContext | null>(null);

export const useAdmin = () => {
	return useContext(AdminContext) as IAdminContext;
};

const AdminProvider: React.FC<PropsWithChildren> = ({children}) => {
	const [report, setReport] = useState<IAdminContext['report']>(null);
  const [loading, setLoading] = useState(false);
  const {auth} = useAuth();

  const getReport: IAdminContext['getReport'] = useCallback(async () => {
    try {
      const res = await fetch(REPORT_URL, {
        headers: getHeaders(auth?.access),
      });
      if(res.status === 200){
        const result = await res.json() as IReport;
        setReport(result);
        setLoading(false);
      } else if(res.status === 400){
        const result = await res.json();
        setLoading(false);
        return result;
      }
    } catch (err) {
      setLoading(false);
      return {
        msg: (err as Error).message,
      }
    }
  }, [REPORT_URL]);

	return (
		<>
			<AdminContext.Provider
				value={{report: report ? {...report} : null, getReport}}
			>
				{children}
			</AdminContext.Provider>
		</>
	);
};

export default React.memo(AdminProvider);
