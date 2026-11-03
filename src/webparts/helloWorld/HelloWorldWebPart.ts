import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
	IPropertyPaneConfiguration,
	PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';
import { getSP } from '../../core/pnp/sp/pnpjs-presets';

import * as strings from 'HelloWorldWebPartStrings';
import HelloWorld, { IHelloWorldProps } from './components/HelloWorld/HelloWorld';
import "../../core/ui/css/formatWorkbench.css";
import { ISendEmailConfig } from '../../core/api/Email/ISendEmailConfig';

export interface IHelloWorldWebPartProps {
	description: string;
	listTitle: string;
	sendEmailObj: ISendEmailConfig;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {

	protected async onInit(): Promise<void> {
		await super.onInit();
		getSP(this.context);
	}

	public render(): void {
		const element: React.ReactElement<IHelloWorldProps> = React.createElement(
			HelloWorld,
			{
				description: escape(this.properties.description),
				listTitle: this.properties.listTitle,
				sendEmailObj: this.properties.sendEmailObj
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
								}),
								PropertyPaneTextField('listTitle', {
									label: strings.ListFieldLabel
								}),
								PropertyPaneTextField('sendEmailObj.url', {
									label: strings.SendEmailURL
								}),
								PropertyPaneTextField('sendEmailObj.key', {
									label: strings.SendEmailKey
								})
							]
						}
					]
				}
			]
		};
	}
}
