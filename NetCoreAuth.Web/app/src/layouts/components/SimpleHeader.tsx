import * as React from 'react';
import { Layout, Button, Space, Typography, } from 'antd';
import { LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Routes from 'config/ConfigureRoutes';
import UserAction from 'redux/UserActions';
import ReduxStoreModel from 'redux/ReduxModel';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import { UserState } from 'redux/UserReducer';
import HistoryUtil from 'utils/HistoryUtil';

const seal = require("../../assets/logo-color.svg");

const { Header } = Layout;

interface SimpleHeaderProps {
    Logout: () => void;
    User: UserState;
}

interface SimpleHeaderState {
}

class SimpleHeader extends React.Component<SimpleHeaderProps, SimpleHeaderState> {
    render() {
        const { isLoggedIn } = this.props.User;

        return (
            <Header className="header">
                <Space style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'space-between'
                }}>
                    <Link to={Routes.GET.BASE_ROUTE} className="logo">
                        <Space>
                            <img src={seal} alt="App Logo" className="header-logo" />
                            <Typography.Title level={4} className="header-text">Application</Typography.Title>
                        </Space>
                    </Link>

                    <Button
                        type="ghost"
                        icon={isLoggedIn ? <LogoutOutlined /> : <LoginOutlined />}
                        style={{ color: 'white' }}
                        onClick={isLoggedIn ? this.props.Logout : this.goToLogin}>
                        {isLoggedIn ? 'Log out' : 'Log in'}
                    </Button>

                </Space>
            </Header >
        );
    }

    private goToLogin = () => {
        return HistoryUtil.push(Routes.GET.LOGIN);
    }
}

function mapDispatchToProps(dispatch: Dispatch<Action>) {
    return ({
        Logout: () => UserAction.Logout(dispatch)
    });
}

function mapStateToProps(state: ReduxStoreModel) {
    return {
        User: state.User,
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(SimpleHeader);
