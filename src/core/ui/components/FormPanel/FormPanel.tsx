import * as React from 'react';
import { DefaultButton, PrimaryButton, Panel, IRenderFunction, IPanelProps } from '@fluentui/react';

import styles from './FormPanel.module.scss';

export interface IFormPanelProps {
	title: string;
	isOpen?: boolean;
	className?: string;
	saveLabel?: string;
	cancelLabel?: string;
	onSave?: ((event?: React.FormEvent<HTMLFormElement>) => void) | (() => void);
	onCancel?: () => void;
	formName?: string;
}

const FormPanel: React.FunctionComponent<IFormPanelProps> = ({
	title,
	isOpen,
	className,
	saveLabel,
	cancelLabel,
	onCancel,
	onSave,
	formName,
	children
}) => {

	const handleDismiss = (event?: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => {
		if (event && 'preventDefault' in event && typeof event.preventDefault === 'function') {
			event.preventDefault();
		}
		if (onCancel) onCancel();
	};

	const handleFooterRender = () => {
		const saveProps = formName
			? { form: formName, type: 'submit' }
			: { onClick: () => { if (onSave) onSave(); } };
		return (
			<React.Fragment>
				{
					saveLabel &&
					<PrimaryButton {...saveProps}>
						{saveLabel}
					</PrimaryButton>
				}
				{
					cancelLabel &&
					<DefaultButton onClick={() => handleDismiss()} className={styles.rightButton}>
						{cancelLabel}
					</DefaultButton>
				}
			</React.Fragment>
		);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (onSave)
			onSave(event);
	};

	const onRenderHeader: IRenderFunction<IPanelProps> = React.useCallback(
		() => (
			<div className={styles.customHeader}>
				<span className={styles.headerTitle}>{title}</span>
				<button
					type="button"
					aria-label={cancelLabel || 'Cerrar'}
					className={styles.closeButton}
					onClick={handleDismiss}
				>
					<span aria-hidden="true">×</span>
				</button>
			</div>
		),
		[title, cancelLabel, handleDismiss]
	);

	const showButtons: boolean = !!(saveLabel || cancelLabel);

	return (
		   <Panel
			   isOpen={isOpen}
			   onDismiss={handleDismiss}
			   closeButtonAriaLabel={cancelLabel}
			   className={`${styles.formPanel} ${className}`}
			   onRenderFooterContent={showButtons ? handleFooterRender : undefined}
			   onRenderHeader={onRenderHeader}
			   isFooterAtBottom={showButtons}
			   hasCloseButton={false}
		   >
			<form className={styles.row} id={formName} onSubmit={handleSubmit}>
				{
					React.Children.map(children, (child) => (
						<div className={styles.column}>
							{ child}
						</div>
					))
				}
			</form>
		</Panel>
	);
};

export default FormPanel;
