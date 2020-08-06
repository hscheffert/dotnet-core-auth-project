import { HttpApi, HttpApiRequestOptions, AxiosResponse } from './ApiHelper';


class AuthControllerInternal {
    // get: api/auth/login
    public RouteLogin = () => `api/auth/login`;
    public login(requestOptions?: HttpApiRequestOptions): Promise<AxiosResponse<void>> {
        let url = this.RouteLogin();
        return HttpApi.RestRequest<any, void>(null, 'get', url, requestOptions);
    }
}
var AuthController = new AuthControllerInternal();
export default AuthController;

