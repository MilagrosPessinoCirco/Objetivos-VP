import { SPFI } from "@pnp/sp";
import { getSP } from "../../pnp/sp/pnpjs-presets";
import Email from "../../entities/Email";
import IEmailManager from "./IEmailManager";
import { ISendEmailConfig } from "./ISendEmailConfig";

export default class EmailManager implements IEmailManager<Email> {

  private _sp: SPFI;
  private sendEmailObj: ISendEmailConfig;

  constructor(sendEmailObj: ISendEmailConfig) {
    this._sp = getSP();
    this.sendEmailObj = sendEmailObj;
  }

  public async sendEmail(
    id: string,
    emails: string[],
    emailsCC: string[],
    subject: string,
    body: string,
  ): Promise<void> {
    try {
      const email = new Email();
      email.Subject = subject;
      email.Body = body;
      email.To = emails.length > 0 ? emails : [];
      email.CC = emailsCC.length > 0 ? emailsCC : [];
      return this.send(email);
    } 
    catch (error) {
      console.error("Error al enviar el correo", error);
      throw error;
    }
  }

  private async send(email: Email): Promise<void> {
    try {
      const response = await fetch(`${this.sendEmailObj.url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.sendEmailObj.key
        },
        body: JSON.stringify({
          To: email.To,
          CC: email.CC && email.CC.length > 0 ? email.CC : undefined,
          Subject: email.Subject,
          Body: email.Body,
        })
      });

      if (!response.ok) {
        let errorData;

        try {
          errorData = await response.json();
        } catch {
          errorData = { error: "Unknown error" };
        }

        throw new Error(
          `Azure Function API error: ${response.status} - ${errorData.error || errorData.errorMessage}`
        );
      }

    } catch (err) {
      console.error("Error enviando email:", err);
      throw err;
    }
  }
}
