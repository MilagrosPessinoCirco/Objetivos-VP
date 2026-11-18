import * as React from 'react';

import { Button } from '../../../../../core/ui/components';
import { Modal } from '../../../../../core/ui/patterns';
import * as strings from 'ObjetivosVpWebPartStrings';

export interface IConfirmacionModalProps {
	title: string;
	message: string;
	isSaving: boolean;
	onAccept: () => void;
	onCancel: () => void;
}

const ConfirmacionModal: React.FC<IConfirmacionModalProps> = ({ title, message, isSaving, onAccept, onCancel }) => (
	<Modal
		open
		variant="default"
		title={title}
		description={message}
		closeOnOverlayClick={false}
		onClose={onCancel}
		primaryAction={
			<Button variant="primary" disabled={isSaving} onClick={onAccept}>
				{strings.Accept}
			</Button>
		}
		secondaryAction={
			<Button variant="secondary" onClick={onCancel}>
				{strings.Cancel}
			</Button>
		}
	/>
);

export default ConfirmacionModal;
