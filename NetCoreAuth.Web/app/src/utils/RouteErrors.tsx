import * as React from 'react';
import { Redirect } from 'react-router-dom';

export const RedirectAs404 = () => {
    const link = {
        pathname: '/areas',
        state: {
            is404: true
        }
    };

    console.log('redirect to', link);
    return <Redirect to={link} />;
};