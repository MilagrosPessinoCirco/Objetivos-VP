import * as React from 'react';
import { ThemeProvider, DefaultButton, MessageBarType } from '@fluentui/react';

import '../../../../core/ui/scss/fonts.module.scss';
import { Footer, LoadingSpinner, MessageBar, List, ShowPanel, Utils, useItemDatasource } from '../../../../core';
import { IMessageBarProps } from '../../../../core/ui/components/MessageBar/MessageBar';
import styles from './Template.module.scss';
import * as strings from 'TemplateWebPartStrings';

export interface ITemplateProps {
	description: string;
	listTitle: string;
}

const Template: React.FunctionComponent<ITemplateProps> = ({ listTitle }) => {

	const [{ items, isLoading, error }, getItems] = useItemDatasource(listTitle);

	const [message, setMessage] = React.useState<IMessageBarProps>({
		text: '',
		messageType: MessageBarType.info
	});

	React.useEffect(() => {
		if(error) {
			setMessage({
				text: strings.ErrorText,
				messageType: MessageBarType.error
			});
		}
	}, [error]);

	React.useEffect(() => {
		if(isLoading) {
			setMessage({
				text: strings.LoadingText,
				messageType: MessageBarType.info
			});
		}
	}, [isLoading]);

	React.useEffect(() => {
		if(!isLoading && items.length > 0) {
			setMessage({
				text: strings.SuccessText,
				messageType: MessageBarType.success
			});
		}
	}, [isLoading, items]);

	return (
		<ThemeProvider className={styles.template}>
			<div>
				<MessageBar {...message} />
				<div className={styles.container}>
					<div className={styles.row}>
						<div className={styles.column}>
							<span className={styles.title}>Mostrar elementos de la lista Prueba</span>
						</div>
					</div>
					<div className={styles.row}>
						<div className={styles.column}>
							<ShowPanel show={isLoading}>
								<LoadingSpinner />
							</ShowPanel>
							<ShowPanel show={items.length > 0 && !isLoading}>
								<div>
									<List items={items} />
								</div>
							</ShowPanel>
						</div>
					</div>
					<div className={styles.row}>
						<div className={styles.column}>
							<DefaultButton text="Obtener Elementos" onClick={getItems} />
						</div>
					</div>
				</div>
				<Footer version={Utils.getVersion()} />
			</div>
		</ThemeProvider>
	);
};

export default Template;
