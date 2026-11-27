import * as React from 'react';

import { spacing } from '../../../../core/ui/foundations';
import AccessList from './AccessList/AccessList';
import styles from './Home.module.scss';
import HomeFooter from './HomeFooter/HomeFooter';
import WelcomeCard from './WelcomeCard/WelcomeCard';

const SCROLLABLE_OVERFLOW = /(auto|scroll)/;
const HOME_HEIGHT_VARIABLE = '--home-height';
// SharePoint termina de acomodar sus barras y márgenes después de montar el web part.
const REMEASURE_DELAYS_MS: number[] = [250, 1000];

// Ancestro con scroll que aloja el web part (en SharePoint, la región de contenido de la página).
const getScrollParent = (element: HTMLElement): HTMLElement | undefined => {
	let parent = element.parentElement;
	while (parent) {
		if (SCROLLABLE_OVERFLOW.test(window.getComputedStyle(parent).overflowY)) {
			return parent;
		}
		parent = parent.parentElement;
	}
	return undefined;
};

// Ajusta el alto de la home al espacio que queda libre en la página, para que no haya scroll vertical.
// El espacio se mide en lugar de fijarse porque las barras de SharePoint (suite bar, barra de depuración)
// y los márgenes de la página cambian según el entorno. Solo lee los ancestros del propio web part.
// Publica el alto en la variable CSS --home-height, de la que salen los tamaños de la lista de accesos.
const useFitToViewport = (ref: React.RefObject<HTMLDivElement>): void => {
	React.useLayoutEffect(() => {
		const element = ref.current;
		if (!element) {
			return undefined;
		}
		const scrollParent = getScrollParent(element);
		const scroller = scrollParent ?? document.documentElement;
		const isPageScroller = scroller === document.documentElement;

		const setHeight = (height: number): void => {
			element.style.height = `${height}px`;
			element.style.setProperty(HOME_HEIGHT_VARIABLE, `${height}px`);
		};

		const update = (): void => {
			const viewportTop = isPageScroller ? 0 : scroller.getBoundingClientRect().top;
			const viewportHeight = isPageScroller ? window.innerHeight : scroller.clientHeight;
			const scrolled = isPageScroller ? window.scrollY : scroller.scrollTop;
			const spaceAbove = element.getBoundingClientRect().top - viewportTop + scrolled;
			const candidate = Math.max(0, Math.floor(viewportHeight - spaceAbove));

			// Con el alto máximo posible se mide cuánto agrega la página debajo del web part y se descuenta.
			setHeight(candidate);
			const overflow = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
			setHeight(Math.max(0, candidate - overflow));
		};

		update();
		const frame = window.requestAnimationFrame(update);
		const timers = REMEASURE_DELAYS_MS.map((delay) => window.setTimeout(update, delay));
		window.addEventListener('resize', update);
		const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : undefined;
		observer?.observe(isPageScroller ? document.body : scroller);

		return () => {
			window.cancelAnimationFrame(frame);
			timers.forEach((timer) => window.clearTimeout(timer));
			window.removeEventListener('resize', update);
			observer?.disconnect();
		};
	}, []);
};

const Home: React.FC = () => {
	const containerRef = React.useRef<HTMLDivElement>(null);
	useFitToViewport(containerRef);

	return (
		<div ref={containerRef} className={styles.container}>
			<div className={styles.home} style={{ columnGap: spacing.xxxl }}>
				<div className={styles.welcome}>
					<WelcomeCard />
				</div>
				<div className={styles.access}>
					<AccessList />
				</div>
				<div className={styles.footer}>
					<HomeFooter />
				</div>
			</div>
		</div>
	);
};

export default Home;
