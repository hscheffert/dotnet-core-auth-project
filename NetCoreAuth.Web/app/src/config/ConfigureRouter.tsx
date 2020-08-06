import * as React from 'react';
import { Switch } from 'react-router-dom';
import Routes from 'config/ConfigureRoutes';
import LayoutComponent from 'core/LayoutComponent';

/* Layouts */
import PublicLayout from 'layouts/PublicLayout';
import MainLayout from 'layouts/MainLayout';

/* Pages */
import PageNotFound from 'pages/public/PageNotFound';
import User from 'pages/user/User';
import Unauthorized from 'pages/Unauthorized';
import Login from 'pages/Login';
import ErrorPage from 'pages/ErrorPage';
import Home from 'pages/Home';
import Empty from 'pages/Empty';
import LoginPage from 'pages/login/LoginPage';

/** Location to where the user will be redirected when found to be unauthorized */
const unauthorizedLocation: string = Routes.GET.UNAUTHORIZED;

/** Location to where the user will be redirected when logout needs to happen */
const logoutLocation: string = Routes.GET.LOGOUT;

const RouteLoader = <Switch>
    <LayoutComponent exact path={Routes.GET.BASE_ROUTE} component={Home} layout={MainLayout} />
    <LayoutComponent exact path={Routes.GET.USER_BASE} component={User} layout={MainLayout} adminOnly={true} />

    <LayoutComponent exact path={Routes.GET.LOGIN} allowAnonymous={true} component={LoginPage} layout={PublicLayout} />

    {/* Error Handling */}
    <LayoutComponent exact path={Routes.GET.ERROR_PAGE} component={ErrorPage} layout={PublicLayout} />
    <LayoutComponent exact path={Routes.GET.PAGE_NOT_FOUND} component={PageNotFound} layout={PublicLayout} />
    <LayoutComponent exact path={Routes.GET.UNAUTHORIZED} allowAnonymous={true} component={Unauthorized} layout={PublicLayout} />

    {/* This needs to be the last item. Path also needs to be undefined */}
    <LayoutComponent path={undefined} component={PageNotFound} layout={PublicLayout} />
</Switch>;

export { RouteLoader, unauthorizedLocation, logoutLocation };
