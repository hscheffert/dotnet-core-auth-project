import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Routes from 'config/ConfigureRoutes';
import PageNotFound from 'pages/public/PageNotFound';
import UserTable from './UserTable';
import UserEdit from './UserEdit';
import { BreadcrumbsItem } from 'pages/shared/GlobalBreadcrumb';

class User extends React.Component<{}> {
    render() {
        return (
            <React.Fragment>
                <BreadcrumbsItem name="users" to={Routes.GET.USER_BASE}>Users</BreadcrumbsItem>

                <Switch>
                    <Route exact path={Routes.GET.USER_BASE} component={UserTable} />
                    <Route exact path={Routes.GET.USER_EDIT} component={UserEdit} />

                    {/* This needs to be the last item */}
                    <Route component={PageNotFound} />
                </Switch>
            </React.Fragment>
        );
    }
}

export default User;
