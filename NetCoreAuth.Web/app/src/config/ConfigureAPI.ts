import axios from 'axios';
import Routes from './ConfigureRoutes';

/**
 * Configure Axios with defaults such as baseurl and headers. Also has interceptors for failed authentication requests
 *
 */
function ConfigureAxios() {
    console.log('Axios base url:', process.env.REACT_APP_BASE_URL);
    axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
    axios.defaults.withCredentials = true;
    // This is an example
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            console.log(error);

            if(error.response && error.response.data && error.response.data.Message) {
                error.message = error.response.data.Message;
                error.description = error.response.data.MessageDetail
            } else {
                if(error.response.status === 500) {
                    error.message = 'Something went wrong';
                }
            }

            if(error.response.status === 403) {
                window.location.href = Routes.GET.UNAUTHORIZED;
            }

            return Promise.reject(error);
        }
    );
}

export default ConfigureAxios;