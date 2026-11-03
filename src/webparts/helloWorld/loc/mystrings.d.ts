const { IDatePickerStrings } = require('@fluentui/react');

declare interface IHelloWorldWebPartStrings {
	PropertyPaneDescription: string;
	BasicGroupName: string;
	DescriptionFieldLabel: string;
	DatePickerStrings: IDatePickerStrings;
	ListFieldLabel: string;
	LoadingText: string;
	SuccessText: string;
	ErrorText: string;
	EmailErrorText: string;
	SuccessSendEmail: string;
	SendEmailURL: string;
  	SendEmailKey: string;
}

declare module 'HelloWorldWebPartStrings' {
	const strings: IHelloWorldWebPartStrings;
	export = strings;
}
