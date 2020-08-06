import { HttpApi, HttpApiRequestOptions, AxiosResponse } from './ApiHelper';
import WeatherForecastDTO from '../models/generated/WeatherForecastDTO';


class WeatherForecastControllerInternal {
    // get: api/weatherforecast
    public RouteGet = () => `api/weatherforecast`;
    public get(requestOptions?: HttpApiRequestOptions): Promise<AxiosResponse<WeatherForecastDTO[]>> {
        let url = this.RouteGet();
        return HttpApi.RestRequest<any, WeatherForecastDTO[]>(null, 'get', url, requestOptions);
    }
}
var WeatherForecastController = new WeatherForecastControllerInternal();
export default WeatherForecastController;

