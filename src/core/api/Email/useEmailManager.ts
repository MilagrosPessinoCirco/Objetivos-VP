import { useReducer } from 'react';
import { createReducer } from '../../../core/utils';
import Email from "../../entities/Email";
import EmailManager from './EmailManager';
import IEmailManager from './IEmailManager';
import { ISendEmailConfig } from './ISendEmailConfig';

const LOAD = 'LOAD';
const ERROR = 'ERROR';
const SEND = 'SEND';

export interface IDatasourceState {
	isLoading: boolean;
	error: {
		hasError: boolean;
		errorCode: number;
	};
}

export type DatasourceHook = [
	IDatasourceState,
	(id: string, emails: string[], emailsCC: string[], subject: string, body: string) => Promise<void>,
];

export default function useEmailManager(sendEmailObj: ISendEmailConfig): DatasourceHook {
	const datasource: IEmailManager<Email> = new EmailManager(sendEmailObj);

	const datasourceReducer = createReducer<IDatasourceState>({
		[LOAD]: (state) => ({ ...state, isLoading: true, error: { hasError: false, errorCode: 0 } }),
		[ERROR]: (state, action) => ({ ...state, error: { hasError: true, errorCode: action.payload }, isLoading: false }),
		[SEND]: (state, action) => ({ ...state, error: { hasError: false, errorCode: 0 }, isLoading: false }),
	});

	const [datasourceState, dispatch] = useReducer(datasourceReducer, { isLoading: false, error: { hasError: false, errorCode: 0 } });

	const handleAsync = (asyncFn: (...args: any[]) => Promise<void>) => (
		async (...args: any[]) => {
			try {
				await asyncFn(...args);
			} catch (error) {
				console.log(error)
				const errorCode = typeof error === 'object' && error !== null && 'status' in error
					? (error as { status: number }).status
					: -1;
				dispatch({ type: ERROR, payload: errorCode });
			}
		}
	);

	const send = handleAsync(async (id: string, emails: string[], emailsCC: string[], subject: string, body: string) => {
		dispatch({ type: LOAD });
		const sendData = await datasource.sendEmail(id, emails, emailsCC, subject, body);
		dispatch({ type: SEND, payload: sendData });
	});

	return [datasourceState, send];
}
