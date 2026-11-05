import * as React from 'react';
import { ThemeProvider } from '@fluentui/react';

import styles from './ObjetivosVp.module.scss';
import * as strings from 'ObjetivosVpWebPartStrings';

export interface IObjetivosVpProps {
	description: string;
}

const ObjetivosVp: React.FunctionComponent<IObjetivosVpProps> = ({ description }) => {
	return (
		<ThemeProvider className={styles.objetivosVp}>
			<div>
				<h2 className={styles.title}>{strings.Title}</h2>
				<p>{description}</p>
			</div>
		</ThemeProvider>
	);
};

export default ObjetivosVp;
