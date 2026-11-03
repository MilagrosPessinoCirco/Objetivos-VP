export default interface IEmailManager<Email> {
	sendEmail(id: string, emails: string[], emailsCC: string[], subject: string, body: string): Promise<void>;
}