import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import { Redirect } from 'react-router-dom';
import { Row, Col, notification, Spin } from 'antd';
import Routes from 'config/ConfigureRoutes';
import LoginForm from './LoginForm';
import UserAction from 'redux/UserActions';
import ReduxStoreModel from 'redux/ReduxModel';
import { UserState } from 'redux/UserReducer';
import LoginDTO from 'models/generated/LoginDTO';
import { PageProps } from 'models/frontend/common/ComponentProps';
import ActionResultDTO from 'models/frontend/common/ActionResultDTO';
import "./Login.scss";

interface LoginPageProps extends PageProps<{}> {
    User: UserState;
    Login: (data: LoginDTO) => Promise<ActionResultDTO>;
}

interface LoginPageState {
    isLoggedIn: boolean;
    loading: boolean;
}

class LoginPage extends React.Component<LoginPageProps, LoginPageState> {
    constructor(props: LoginPageProps) {
        super(props);

        this.state = {
            isLoggedIn: false,
            loading: false,
        };
    }

    handleLoginClick = async (data: LoginDTO) => {
        // Don't crush the login endpoint
        if (this.state.loading) {
            return;
        }

        this.setState({ loading: true });
        try {
            const result = await this.props.Login(data);

            console.log(result);
            if (result.isError) {
                notification.error({
                    message: "Login",
                    description: ["There was an error logging you in", result.message].map(x => <div>{x}</div>),
                    duration: 10
                });
            }
            this.setState({ loading: false });
        } catch(error) {
            notification.error({
                message: "Login",
                description: ["There was an error logging you in", error.message].map(x => <div>{x}</div>),
                duration: 10
            });
        }
    }

    render() {
        if (this.props.User.state === "finished") {
            return <Redirect to={Routes.GET.BASE_ROUTE} push />;
        }

        return (
            <Spin spinning={this.state.loading}>
                <div className="login-page">
                    <Row>
                        <Col
                            xs={{ span: 22, offset: 1 }}
                            md={{ span: 12, offset: 6 }}
                            lg={{ span: 10, offset: 7 }}
                            xl={{ span: 8, offset: 8 }}>
                            <h2>Login</h2>
                            <LoginForm
                                onSubmit={this.handleLoginClick}
                                isSubmitting={this.state.loading} />
                        </Col>
                    </Row>
                </div>
            </Spin>

        );
    }
}

function mapDispatchToProps(dispatch: Dispatch<Action>) {
    return {
        Login: (data: LoginDTO) => UserAction.Login(dispatch, data),
    };
}

function mapStateToProps(state: ReduxStoreModel) {
    return {
        User: state.User,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
