import * as React from 'react';
import { Spin } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import bindAllOfThis from "../src/utils/BindThisHelper";
import { RouteLoader } from 'config/ConfigureRouter';
import { DebugUtil } from 'utils';
import Routes from 'config/ConfigureRoutes';

import 'antd/dist/antd.css'; // Ant Design specific styles
import './App.scss'; // Site SCSS files


interface AppProps extends RouteComponentProps {
}

interface AppState {
    /**
     * Used for loading data that the user MUST wait for.
     *
     * Examples: Multilingual data, Translations, Constants, Roles, Assets, etc.
     */
    isLoading: boolean;
}

/** This class is VERY special. It handles loading react, the routes and any 'on startup' logic */
class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        bindAllOfThis(this, App.prototype);

        this.state = {
            // Set to true if you need some pre-app loading
            isLoading: false,
        };
    }
    
    componentDidCatch(e: Error) {
        // Dev errors are handled much better by Create React App
        if (DebugUtil.isDebugEnabled()) {
            // Errors are stupid and wont stringify properly
            var error: string = JSON.stringify({
                name: e.name,
                message: e.message,
                stack: e.stack
            });
            this.props.history.push({
                pathname: Routes.GET.ERROR_PAGE,
                state: { errors: error }
            });
        }
    }

    render() {
        // Check if loading, render a spinner. You can disable this and remove it entirely for slightly faster load times
        if (this.state.isLoading) {
            return <div className="App">
                <Spin key="fancySpinnerOfDoom" className="spinner-centered very-large-spinner" />
            </div>;
        }

        // Render the app by loading the router. This includes layouts and other such logic
        return <div className="App">
            {RouteLoader}
        </div>;
    }
}

export default withRouter(App);
