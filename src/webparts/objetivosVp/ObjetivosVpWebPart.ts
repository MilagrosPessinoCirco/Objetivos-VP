import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
	IPropertyPaneConfiguration,
	PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import * as strings from 'ObjetivosVpWebPartStrings';
import ObjetivosVp, { IObjetivosVpProps } from './components/ObjetivosVp/ObjetivosVp';
import { getSP } from '../../core/pnp/sp/pnpjs-presets';

require('../../core/ui/css/fix.css');
require('../../core/ui/css/formatWorkbench.css');

export interface IObjetivosVpWebPartProps {
	description: string;
}

export default class ObjetivosVpWebPart extends BaseClientSideWebPart<IObjetivosVpWebPartProps> {

	protected async onInit(): Promise<void> {
		await super.onInit();
		getSP(this.context);
	}

	public render(): void {
		const element: React.ReactElement<IObjetivosVpProps> = React.createElement(
			ObjetivosVp,
			{
				description: escape(this.properties.description)
			}
		);

		ReactDom.render(element, this.domElement);
	}

	protected onDispose(): void {
		ReactDom.unmountComponentAtNode(this.domElement);
	}

	protected get dataVersion(): Version {
		return Version.parse('1.0');
	}

	protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
		return {
			pages: [
				{
					header: {
						description: strings.PropertyPaneDescription
					},
					groups: [
						{
							groupName: strings.BasicGroupName,
							groupFields: [
								PropertyPaneTextField('description', {
									label: strings.DescriptionFieldLabel
								})
							]
						}
					]
				}
			]
		};
	}
}
