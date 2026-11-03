import * as React from 'react';
import styles from './Footer.module.scss';
import { Utils } from '../../../../core';

import { Footer as CoreFooter } from '../../../../core/ui/components';

const Footer: React.FunctionComponent = () => (
	<div className={styles.Footer}>
		<div className={styles.Footer_Row}>
			<ul className={styles.Footer_Row_Footer}>
				<li className={styles.Footer_Row_Footer_Girt}>
					<CoreFooter version={Utils.getVersion()} className={styles.Footer_Row_Footer_Girt_Core} />
				</li>
			</ul>
		</div>
	</div>
);

export default Footer;
