import { HttpApi, HttpApiRequestOptions, AxiosResponse } from './ApiHelper';
import TableRequestDTO from '../models/generated/TableRequestDTO';
import TableResponseDTO from '../models/generated/TableResponseDTO';
import UserDTO from '../models/generated/UserDTO';


class UserApiControllerInternal {
    // get: api/user/GetAll
    public RouteGetAll = () => `api/user/GetAll`;
    public getAll(requestOptions?: HttpApiRequestOptions): Promise<AxiosResponse<UserDTO[]>> {
        let url = this.RouteGetAll();
        return HttpApi.RestRequest<any, UserDTO[]>(null, 'get', url, requestOptions);
    }
    // get: api/user/GetById/${encodeURIComponent(id)}
    public RouteGetById = (id: string) => `api/user/GetById/${encodeURIComponent(id)}`;
    public getById(id: string, requestOptions?: HttpApiRequestOptions): Promise<AxiosResponse<UserDTO>> {
        let url = this.RouteGetById(id);
        return HttpApi.RestRequest<any, UserDTO>(null, 'get', url, requestOptions);
    }
    // post: api/user/GetDataTableResponse
    public RouteGetDataTableResponse = (tableRequestDTO: TableRequestDTO) => `api/user/GetDataTableResponse`;
    public getDataTableResponse(tableRequestDTO: TableRequestDTO, requestOptions?: HttpApiRequestOptions): Promise<AxiosResponse<TableResponseDTO<UserDTO>>> {
        let url = this.RouteGetDataTableResponse(tableRequestDTO);
        return HttpApi.RestRequest<any, TableResponseDTO<UserDTO>>(tableRequestDTO, 'post', url, requestOptions);
    }
}
var UserApiController = new UserApiControllerInternal();
export default UserApiController;

