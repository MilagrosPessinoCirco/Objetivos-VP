import * as React from 'react';
import { ThemeProvider } from '@fluentui/react';

import Home from '../Home/Home';
import styles from './ObjetivosVp.module.scss';

export interface IObjetivosVpProps {
	description: string;
}

const ObjetivosVp: React.FunctionComponent<IObjetivosVpProps> = () => {
	return (
		<ThemeProvider className={styles.objetivosVp}>
			<Home />
		</ThemeProvider>
	);
};

export default ObjetivosVp;
