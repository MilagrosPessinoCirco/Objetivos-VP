import * as React from 'react';
import { MessageBarType } from '@fluentui/react';
import { Banner, MessageBar, useItemDatasource } from "../../../../core";
import { IMessageBarProps } from '../../../../core/ui/components/MessageBar/MessageBar';
import '../../../../core/ui/scss/fonts.module.scss';
import Main from "../Main/Main";
import Footer from "../Footer/Footer";
import styles from './HelloWorld.module.scss';
import * as strings from 'HelloWorldWebPartStrings';
import useEmailManager from "../../../../core/api/Email/useEmailManager";
import { ISendEmailConfig } from '../../../../core/api/Email/ISendEmailConfig';

export interface IHelloWorldProps {
	description: string;
	listTitle: string;
	sendEmailObj: ISendEmailConfig;
}

const HelloWorld: React.FunctionComponent<IHelloWorldProps> = ({ description, listTitle, sendEmailObj }) => {

	const [{ items, isLoading, error }, getItems, addItem, editItem, deleteItem] =  useItemDatasource(listTitle);
	const [{ error: errorEmail }, sendEmail] = useEmailManager(sendEmailObj);
	
	interface IMessageWithId extends IMessageBarProps {
	  id: string;
	}
	
	const [messages, setMessages] = React.useState<IMessageWithId[]>([]);
	function addMessage(msg: Omit<IMessageWithId, 'id'>) {
	  setMessages(msgs => [
	    ...msgs,
	    { ...msg, id: Date.now().toString() + Math.random().toString(36).substring(2, 7) }
	  ]);
	}
	
	React.useEffect(() => {
		if (error) {
			addMessage({ text: strings.ErrorText, messageType: MessageBarType.error });
		}
	}, [error]);
	
	React.useEffect(() => {
		if (errorEmail.hasError) {
			addMessage({ text: strings.EmailErrorText, messageType: MessageBarType.error });
		}
	}, [errorEmail]);
	
	React.useEffect(() => {
		if (isLoading) {
			addMessage({ text: strings.LoadingText, messageType: MessageBarType.info, time: 1 });
		}
	}, [isLoading]);
	
	React.useEffect(() => {
		if (!isLoading && items.length > 0) {
			setMessages(msgs => [
				...msgs.filter(m => m.messageType !== MessageBarType.info || m.text !== strings.LoadingText),
				{ text: strings.SuccessText, messageType: MessageBarType.success, id: Date.now().toString() + Math.random().toString(36).substring(2, 7) }
			]);
		}
	}, [isLoading, items]);
	
	React.useEffect(() => {
		getItems();
	}, [listTitle]);

	const handleAddItem = async (item: any) => {
		const created = await addItem(item);
		return created;
	};
	const [emailJustSent, setEmailJustSent] = React.useState(false);

	const handleSendEmail = async (...args: Parameters<typeof sendEmail>) => {
		await sendEmail(...args);
		setEmailJustSent(true);
	};

	React.useEffect(() => {
		if (emailJustSent && !errorEmail.hasError && errorEmail.errorCode === 0 && !isLoading) {
			addMessage({ text: strings.SuccessSendEmail, messageType: MessageBarType.success });
			setEmailJustSent(false);
		}
	}, [emailJustSent, errorEmail, isLoading]);

	return (
		<div className={styles.Home}>
			<div className={styles.Home_Container}>
				<div className={styles.Home_Container_Row}>
					<div className={styles.Home_Container_Row_Column}>
						<div className={styles.messageBarContainer}>
						  {messages.map((msg) => (
						    <MessageBar key={msg.id} messageType={msg.messageType} text={msg.text} time={msg.time} />
						  ))}
						</div>
						<Banner title="HELLO WORLD!" description={description} />
						<Main items={items} onAdd={handleAddItem} onEdit={editItem} onDelete={deleteItem} sendMail={handleSendEmail} />
						<Footer />
					</div>
				</div>
			</div>
		</div>
	);
};

export default HelloWorld;
