import * as React from 'react';
import { notification, Spin, } from 'antd';
import WeatherForecastDTO from '../models/generated/WeatherForecastDTO';
import WeatherForecastController from '../api/WeatherForecastController';


interface HomeProps {
}

interface HomeState {
    forecasts: WeatherForecastDTO[];
    loading: boolean;
}

class Home extends React.Component<HomeProps, HomeState> {
    constructor(props: HomeProps) {
        super(props);
        this.state = {
            forecasts: [],
            loading: true
        };
    }


    componentDidMount() {
        this.populateWeatherData();
    }

    renderForecastsTable = () => {
        return (
            <table className='table table-striped' aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Temp. (C)</th>
                        <th>Temp. (F)</th>
                        <th>Summary</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.forecasts.map(forecast =>
                        <tr key={forecast.date}>
                            <td>{forecast.date}</td>
                            <td>{forecast.temperatureC}</td>
                            <td>{forecast.temperatureF}</td>
                            <td>{forecast.summary}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    render() {
        return (
            <Spin spinning={this.state.loading}>
                <h1>Weather forecast</h1>
                <p>This component demonstrates fetching data from the server.</p>
                {this.renderForecastsTable()}
            </Spin>
        );
    }

    async populateWeatherData() {
        this.setState({ loading: true });
        try {
            const result = await WeatherForecastController.get();

            this.setState({
                loading: false,
                forecasts: result.data,
            });
        } catch (err) {
            this.setState({ loading: false });
            console.log(err.message);
            notification.error({
                message: err.message,
                description: err.description
            });
        }
    }
}

export default Home;
