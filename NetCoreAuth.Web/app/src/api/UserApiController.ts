import { HttpApi, HttpApiRequestOptions, AxiosResponse } from './ApiHelper';
import UserDTO from '../models/generated/UserDTO';


class UserApiControllerInternal {
    // get: api/user/GetAll
    public RouteGetAll = () => `api/user/GetAll`;
    public getAll(requestOptions?: HttpApiRequestOptions): Promise<AxiosResponse<UserDTO[]>> {
        let url = this.RouteGetAll();
        return HttpApi.RestRequest<any, UserDTO[]>(null, 'get', url, requestOptions);
    }
}
var UserApiController = new UserApiControllerInternal();
export default UserApiController;

