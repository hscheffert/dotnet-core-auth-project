import axios, { AxiosResponse as potato, ResponseType } from 'axios';

export type HttpVerb = "GET" | "POST" | "PUT" | "DELETE";

// Dev Note: Interfaces in TypeScript are weird and must be directly exported as types. Otherwise, the compiler gets confused
export type AxiosResponse<T = any> = potato<T>;

export class HttpApiRequestOptions {
    /**
     * Skips the normal login redirect when a 401 is encountered. Critical for login and login check requests
     */
     ignoreAuthenticationErrors?: boolean;
     responseType?: ResponseType;

    /**
     * Both the FormData to be posted to the given URL and the indication that this call will post FormData
     */
    formData?: FormData;
    constructor() {
        this.ignoreAuthenticationErrors = false;
        this.formData = null;
    }
}

export interface HttpApiResult<T> {
    headers: object;
    ok: boolean;
    redirected: boolean;
    status: number;
    statusText: string;

    body: T;
}

/** Provides a wrapper to make standardized http requests */
export class HttpApi {

    protected static httpMethodToHttpVerb(input: string): HttpVerb {
        // Takes a string and makes it typed as HttpVerb
        switch (input.toLowerCase()) {
            case "get":
                return "GET";
            case "post":
                return "POST";
            case "put":
                return "PUT";
            case "delete":
                return "DELETE";
            default:
                return null;
        }
    }

    protected static baseInfo<TRequest>(req: TRequest, method: HttpVerb, requestOptions: HttpApiRequestOptions): RequestInit {
        if (requestOptions.formData != null) {
            return {
                method: method,
                body: requestOptions.formData,
            };
        }
        var requestInfo: RequestInit = {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache': 'no-cache',
                'Access-Control-Allow-Credentials': 'true'
            },
            credentials: 'include'
        };

        if (method !== "GET") {
            requestInfo.body = JSON.stringify(req);
        }

        return requestInfo;
    }

    public static RestRequest<TRequest, TResult>(req: TRequest, requestVerb: string, url: string, requestOptions: HttpApiRequestOptions) {
        requestOptions = requestOptions || {};
        let verb = this.httpMethodToHttpVerb(requestVerb);

        // TODO: JB - See about consolidating
        let request: Promise<AxiosResponse<TResult>>;
        switch (verb) {
            case "GET":
                request = axios.get<TRequest, AxiosResponse<TResult>>(url, { responseType: requestOptions.responseType });
                break;
            case "POST":
                request = axios.post<TRequest, AxiosResponse<TResult>>(url, req);
                break;
            case "PUT":
                request = axios.put<TRequest, AxiosResponse<TResult>>(url, req);
                break;
            case "DELETE":
                request = axios.delete<TRequest, AxiosResponse<TResult>>(url, req);
                break;
            default:
                request = axios.request<TRequest, AxiosResponse<TResult>>({url, data: req, method: verb});
                break;
        }

        return request;
    }
}
