export type HttpMethod = 'GET' | 'POST' | 'PUT'

export const isOfTypeHttpMethod = (keyInput: string): keyInput is HttpMethod => ['GET', 'POST', 'PUT'].includes(keyInput);

export interface InputRequestParams {
    [param: string]: string
}

export interface InputRequest {
    name: string;
    url: string;
    method: HttpMethod;
    params: InputRequestParams;
    important?: boolean;
}
