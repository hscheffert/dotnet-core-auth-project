import * as React from 'react';
import { Link } from 'react-router-dom';
import Routes from 'config/ConfigureRoutes';

interface ErrorPageProps {
}

interface ErrorPageState {
}

class ErrorPage extends React.Component<ErrorPageProps, ErrorPageState> {
    render() {
        return (
            <div>
                <h1>An error occurred while processing your request.</h1>
                <Link to={Routes.GET.BASE_ROUTE}>
                   Go To Home
                </Link>
            </div>
        );
    }
}

export default ErrorPage;
