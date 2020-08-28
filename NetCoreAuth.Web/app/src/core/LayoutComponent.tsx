import * as React from "react";
import { RouteComponentProps, Route, Redirect, RouteProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindAllOfThis } from "utils";
import UserAction from 'redux/UserActions';
import { Dispatch, Action } from 'redux';
import { ProjectLayouts, defaultLayout } from "config/ConfigureLayouts";
import { unauthorizedLocation } from "config/ConfigureRouter";

import ReduxStoreModel from "redux/ReduxModel";
import { UserState } from "redux/UserReducer";
import ActionResultDTO from "models/frontend/common/ActionResultDTO";
import { Spin } from "antd";
import Routes from "config/ConfigureRoutes";

/**
 * A Slimmed down version of RouteProps
 */
interface LayoutComponentProps extends RouteProps {
    // Required Props
    /** The path to the React page. Arrays are supported but discouraged */
    path?: string | string[];
    /** The React component to render */
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
    /** The layout to render the component in */
    layout: ProjectLayouts;
    allowAnonymous?: boolean;
    adminOnly?: boolean;

    // Other props not passed it, but are coming from the context somewhere
    /**
     * Defines if the path matches exactly or if it just starts with the path.
     *
     * **Default: true**
     *
     * Ex. When true, '/foo' will match the browser '/foo' but not '/foo/bar/'. False will match Both
     */
    exact?: boolean;

    /**
     * Defines if the path with ignore a trailing '/' from a route. Has interesting effects with 'exact: true'
     *
     * **Defaults: false**
     *
     * Ex. When true, '/foo' will match the browser '/foo' but not '/foo/'
     */
    strict?: boolean;

    /**
     * Defines if the path is case-sensitive. Affects all checks and is not recommended for many reasons
     *
     *  **Defaults: false**
     */
    sensitive?: boolean;

    /**
     * **From Redux, do not fill in**
     */
    User: UserState;

    SoftLogin: () => Promise<ActionResultDTO>;
}

interface LayoutComponentState {
    isLoading: boolean;
}

class LayoutComponent extends React.Component<LayoutComponentProps, LayoutComponentState> {
    constructor(props: LayoutComponentProps) {
        super(props);
        bindAllOfThis(this, LayoutComponent.prototype);

        this.state = {
            isLoading: false
        };
    }

    getComponent(routerContext: RouteComponentProps<{}>): JSX.Element {
        let Layout = this.props.layout;
        let Component = this.props.component;

        // Can't do much without a component!
        if (Component == null) {
            throw new Error('\'component\' prop must be set!');
        }

        // Missing the layout is lazy but we DO have a default
        if (Layout == null) {
            Layout = defaultLayout;
        }

        const userDoesNotHavePermissionForAdminPage = this.props.adminOnly && !this.props.User.isAdmin;
        const userIsNotLoggedInForPrivatePage = !this.props.allowAnonymous && !this.props.User.isLoggedIn;

        // console.log(this.props.User);

        if (userIsNotLoggedInForPrivatePage) {
            return <Redirect to={Routes.GET.LOGIN} from={routerContext.location.pathname} />;
        }

        // if (userDoesNotHavePermissionForAdminPage) {
        //     return <Redirect to={unauthorizedLocation} from={routerContext.location.pathname} />;
        // }

        // Render the layout with the component. It is passed the routerContext, which contains some really nice page level information
        return (
            <Layout {...routerContext}>
                <Component {...routerContext} key={window.location.href} />
            </Layout>
        );
    }

    componentDidMount() {
        this.setState({ isLoading: true });
        this.props.SoftLogin()
            .catch(error => {
                console.error(error);
            }).finally(() => {
                this.setState({ isLoading: false });
            });
    }

    render() {
        // TODO: JB - move this to app.tsx later
        if (this.state.isLoading) {
            return <Spin size="large" spinning></Spin>;
        }

        // You must absolutely return a <Route> tag for the router to work
        return <Route key="routeKey"
            exact={this.props.exact}
            strict={this.props.strict}
            sensitive={this.props.sensitive}
            path={this.props.path}
            render={routerContext => this.getComponent(routerContext)} />;
    }
}

function mapDispatchToProps(dispatch: Dispatch<Action>) {
    return ({
        SoftLogin: () => UserAction.SoftLogin(dispatch)
    });
}

function mapStateToProps(state: ReduxStoreModel) {
    return {
        User: state.User,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutComponent);
