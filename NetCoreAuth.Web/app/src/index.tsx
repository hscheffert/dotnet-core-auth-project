import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { History, DebugUtil } from 'utils'; // Generates a default history state
import Store from 'config/ConfigureRedux';
import ConfigureAxios from 'config/ConfigureAPI'; // API Defaults
import App from './App';
import moment from 'moment';
// @ts-ignore
import { ThroughProvider } from 'react-through';

ConfigureAxios();

if (DebugUtil.isDebugEnabled()) {
    let buildDate = moment(process.env.REACT_APP_BUILD_DATE);
    let today = moment();
    let yesterday = moment().add(-1, 'days');

    let buildString = buildDate.isSameOrAfter(today, "day")
        // Build was made today
        ? `Build created Today at ${buildDate.format("LT")}`
        : buildDate.isSameOrAfter(yesterday, "day")
            // Build was made yesterday
            ? `Build created Yesterday at ${buildDate.format("LT")}`
            // Build was much longer ago
            : `Build created on (${buildDate.format("LL")}) at ${buildDate.format("LT")}`;

    console.error("Debug Enabled");
    console.warn(`Environment: ${process.env.REACT_APP_ENVIRONMENT}`);
    console.warn(buildString);
}

ReactDOM.render(
    <ThroughProvider>
        <Provider store={Store}>
            <Router history={History}>
                <App />
            </Router>
        </Provider>
    </ThroughProvider>,
    document.getElementById('root') as HTMLElement
);