import { HttpApi, HttpApiRequestOptions, AxiosResponse } from './ApiHelper';
import CreateUserDTO from '../models/generated/CreateUserDTO';
import LoginDTO from '../models/generated/LoginDTO';


class AccountApiControllerInternal {
    // post: api/account/CreateUser
    public RouteCreateUser = (dto: CreateUserDTO) => `api/account/CreateUser`;
    public createUser(dto: CreateUserDTO, requestOptions?: HttpApiRequestOptions): Promise<AxiosResponse<void>> {
        let url = this.RouteCreateUser(dto);
        return HttpApi.RestRequest<any, void>(dto, 'post', url, requestOptions);
    }
    // post: api/account/Login
    public RouteLogin = (dto: LoginDTO) => `api/account/Login`;
    public login(dto: LoginDTO, requestOptions?: HttpApiRequestOptions): Promise<AxiosResponse<void>> {
        let url = this.RouteLogin(dto);
        return HttpApi.RestRequest<any, void>(dto, 'post', url, requestOptions);
    }
    // get: api/account/Logout
    public RouteLogout = () => `api/account/Logout`;
    public logout(requestOptions?: HttpApiRequestOptions): Promise<AxiosResponse<void>> {
        let url = this.RouteLogout();
        return HttpApi.RestRequest<any, void>(null, 'get', url, requestOptions);
    }
    // get: api/account/GetCurrentUserName
    public RouteGetCurrentUserName = () => `api/account/GetCurrentUserName`;
    public getCurrentUserName(requestOptions?: HttpApiRequestOptions): Promise<AxiosResponse<void>> {
        let url = this.RouteGetCurrentUserName();
        return HttpApi.RestRequest<any, void>(null, 'get', url, requestOptions);
    }
}
var AccountApiController = new AccountApiControllerInternal();
export default AccountApiController;

