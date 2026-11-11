import * as React from 'react';
import { ThemeProvider } from '@fluentui/react';
import { HashRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';

import { Button } from '../../../../core/ui/components';
import { colors, spacing, typography } from '../../../../core/ui/foundations';
import Home from '../Home/Home';
import styles from './ObjetivosVp.module.scss';

export interface IObjetivosVpProps {
	description: string;
}

const pageStyle: React.CSSProperties = { padding: spacing.xl };

const titleStyle: React.CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[32],
	lineHeight: typography.lineHeight[32],
	fontWeight: typography.weight.bold,
	color: colors.neutral.textMuted,
	margin: 0,
	marginBottom: spacing.lg
};

const ObjetivosVpRoutes: React.FC = () => {
	const navigate = useNavigate();
	const goHome = (): void => navigate('/');

	return (
		<Routes>
			<Route path="/" element={<Home />} />

			{/* Palanca */}
			{/* TODO: reemplazar por <PalancaBandeja /> */}
			<Route path="/palanca" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Palanca: Bandeja</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <PalancaForm /> */}
			<Route path="/palanca/new" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Palanca: Nuevo</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <PalancaForm /> */}
			<Route path="/palanca/edit/:id" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Palanca: Edición</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <PalancaDetalle /> */}
			<Route path="/palanca/:id" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Palanca: Detalle</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>

			{/* Objetivo */}
			{/* TODO: reemplazar por <ObjetivoBandeja /> */}
			<Route path="/objetivo" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Objetivo: Bandeja</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <ObjetivoForm /> */}
			<Route path="/objetivo/new" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Objetivo: Nuevo</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <ObjetivoForm /> */}
			<Route path="/objetivo/edit/:id" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Objetivo: Edición</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <ObjetivoDetalle /> */}
			<Route path="/objetivo/:id" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Objetivo: Detalle</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>

			{/* Iniciativa */}
			{/* TODO: reemplazar por <IniciativaBandeja /> */}
			<Route path="/iniciativa" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Iniciativa: Bandeja</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <IniciativaForm /> */}
			<Route path="/iniciativa/new" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Iniciativa: Nuevo</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <IniciativaForm /> */}
			<Route path="/iniciativa/edit/:id" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Iniciativa: Edición</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <IniciativaDetalle /> */}
			<Route path="/iniciativa/:id" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Iniciativa: Detalle</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>

			{/* Tarea */}
			{/* TODO: reemplazar por <TareaBandeja /> */}
			<Route path="/tarea" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Tarea: Bandeja</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <TareaForm /> */}
			<Route path="/tarea/new" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Tarea: Nuevo</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <TareaForm /> */}
			<Route path="/tarea/edit/:id" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Tarea: Edición</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
			{/* TODO: reemplazar por <TareaDetalle /> */}
			<Route path="/tarea/:id" element={
				<div style={pageStyle}>
					<h1 style={titleStyle}>Tarea: Detalle</h1>
					<Button variant="secondary" onClick={goHome}>Volver a la home</Button>
				</div>
			}/>
		</Routes>
	);
};

const ObjetivosVp: React.FunctionComponent<IObjetivosVpProps> = () => {
	return (
		<ThemeProvider className={styles.objetivosVp}>
			<Router>
				<ObjetivosVpRoutes />
			</Router>
		</ThemeProvider>
	);
};

export default ObjetivosVp;
