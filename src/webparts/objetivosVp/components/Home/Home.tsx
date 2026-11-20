import * as React from 'react';

import { spacing } from '../../../../core/ui/foundations';
import AccessList from './AccessList/AccessList';
import styles from './Home.module.scss';
import HomeFooter from './HomeFooter/HomeFooter';
import WelcomeCard from './WelcomeCard/WelcomeCard';

const Home: React.FC = () => {
	return (
		<div className={styles.container} style={{ padding: `${spacing.xl} ${spacing.xxl}` }}>
			<div className={styles.home} style={{ columnGap: spacing.xxxl }}>
				<div className={styles.leftColumn}>
					<WelcomeCard />
					<HomeFooter />
				</div>
				<div className={styles.rightColumn}>
					<AccessList />
				</div>
			</div>
		</div>
	);
};

export default Home;
