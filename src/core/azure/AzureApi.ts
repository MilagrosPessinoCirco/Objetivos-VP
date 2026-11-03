import { Observable, InvokeShowError } from "..";
import AzureResponse from "./AzureResponse";
import { AZURE_URL, AZURE_ERROR, AZURE_API } from "../utils/Constants";

export default class AzureApi {
  private buildQueryString(data: any): string {
    return Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join("&");
  }

  private async handleResponse(cResponse: Response, showError: boolean = true): Promise<AzureResponse | boolean | null> {
    switch (cResponse.status) {
      case 200: {
        const jsonOk = await cResponse.json();
        const azureResultOk: AzureResponse = jsonOk as AzureResponse;
        return azureResultOk instanceof AzureResponse ? azureResultOk : true;
      }
      case 400: {
        const json = await cResponse.json();
        const azureResult: AzureResponse = json as AzureResponse;
        const errMsg = `${AZURE_ERROR} - > ${azureResult.Status}: ${azureResult.Message}, ${azureResult.Value}`;
        if (showError) {
          Observable.Instance().Invoke(
            InvokeShowError({ value: errMsg, Msg: errMsg })
          );
        } else {
          console.log("Error 400 details: ", errMsg);
        }
        return showError ? azureResult : false;
      }
      default: {
        let errText = await cResponse.text();
        errText = !errText
          ? `Status: ${cResponse.status} - StatusText: ${cResponse.statusText}`
          : `${AZURE_ERROR}  -> ${errText}`;
        if (showError) {
          Observable.Instance().Invoke(
            InvokeShowError({ value: errText, Msg: errText })
          );
        } else {
          console.log("Error details: ", errText);
        }
        return showError ? null : false;
      }
    }
  }

  private handleError(error: unknown, showError: boolean = true): AzureResponse | boolean {
    let errorMsg: string;
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (typeof error === "string") {
      errorMsg = error;
    } else {
      errorMsg = JSON.stringify(error);
    }
    if (showError) {
      Observable.Instance().Invoke(
        InvokeShowError({
          value: `Error de red: ${AZURE_ERROR} ->  ${errorMsg}`,
          Msg: error,
        })
      );
      return new AzureResponse();
    } else {
      console.log(errorMsg);
      if (typeof error === "object" && error && (error as any).message === "Failed to fetch") {
        const azRes = new AzureResponse();
        azRes.Status = "ERROR";
        azRes.Message = (error as any).message;
        azRes.Value = typeof error === "string" ? error : JSON.stringify(error);
        console.log(error.toString());
      }
      return false;
    }
  }

  public async CheckConnectivity(op: string): Promise<boolean> {
    try {
      const headers = new Headers();
      headers.append("accept", "application/json;odata.metadata=none");
      const params: RequestInit = {
        method: "GET",
        headers: headers,
        mode: "cors",
        cache: "default",
      };

      const url = `${AZURE_URL}/${AZURE_API}/${op}`;
      const info: RequestInfo = new Request(url);
      const request: Request = new Request(info, params);

      const res = await fetch(request);
      const cResponse = res.clone();
      const result = await this.handleResponse(cResponse, false);
      return result === true;
    } catch (error) {
      return this.handleError(error, false) as boolean;
    }
  }

  public async Get(
    op: string,
    data: any = null,
    isGet: boolean = true,
    isJson: boolean = true
  ): Promise<AzureResponse> {
    try {
      const headers = new Headers();
      headers.append("accept", "application/json;odata.metadata=none");
      let params: RequestInit;
      let url = `${AZURE_URL}/${AZURE_API}/${op}`;

      if (isGet) {
        params = {
          method: "GET",
          headers: headers,
          mode: "cors",
          cache: "default",
        };
        if (data) {
          url = `${url}?${this.buildQueryString(data)}`;
        }
      } else {
        headers.append("Content-Type", "application/json");
        params = {
          method: "POST",
          headers: headers,
          mode: "cors",
          cache: "default",
          body: isJson ? JSON.stringify(data) : data,
        };
      }

      const info: RequestInfo = new Request(url);
      const request: Request = new Request(info, params);
      const response = await fetch(request);
      const cResponse = response.clone();
      const resOk = await this.handleResponse(cResponse, true);
      return (resOk && resOk instanceof AzureResponse) ? resOk : new AzureResponse();
    } catch (error) {
      return this.handleError(error, true) as AzureResponse;
    }
  }
}
