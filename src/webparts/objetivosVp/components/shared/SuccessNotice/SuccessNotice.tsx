import * as React from 'react';

import { MessageBar } from '../../../../../core/ui/patterns';
import styles from './SuccessNotice.module.scss';

export interface ISuccessNoticeProps {
	message?: string;
	onClose: () => void;
}

const NOTICE_DURATION_MS = 7000;

const SuccessNotice: React.FC<ISuccessNoticeProps> = ({ message, onClose }) => {
	React.useEffect(() => {
		if (message === undefined) {
			return undefined;
		}
		const timer = window.setTimeout(onClose, NOTICE_DURATION_MS);
		return () => window.clearTimeout(timer);
	}, [message]);

	if (message === undefined) {
		return null;
	}

	return (
		<div className={styles.notice}>
			<MessageBar className={styles.noticeBar} type="success" darkMode={false} message={message} dismissible onClose={onClose} />
		</div>
	);
};

export default SuccessNotice;
