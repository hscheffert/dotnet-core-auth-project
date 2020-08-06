import * as React from 'react';
import { Link } from 'react-router-dom';
import { Space, Button } from 'antd';
import UserAction from 'redux/UserActions';
import { UserState } from 'redux/UserReducer';
import { Dispatch, Action } from 'redux';
import ReduxStoreModel from 'redux/ReduxModel';
import { connect } from 'react-redux';

interface UnauthorizedComponentProps {
    Login: () => void;
    User: UserState;
}

class UnauthorizedComponent extends React.Component<UnauthorizedComponentProps, {}> {
    render() {
        const { isLoggedIn } = this.props.User;

        if (isLoggedIn) {
            return (
                <div style={{ padding: '24px' }}>
                    <h2>Unauthorized</h2>
                    <p>You are not authorized to view this page.</p>
                    <Space direction="vertical">
                        <Link to="/">Go to Homepage</Link>
                    </Space>
                </div>
            );
        }

        return (
            <div style={{ padding: '24px' }}>
                <h2>Unauthorized</h2>
                <p>Please log in.</p>
                <Button type="primary" onClick={this.props.Login}>Login</Button>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch: Dispatch<Action>) {
    return ({
        Login: () => UserAction.Login(dispatch)
    });
}

function mapStateToProps(state: ReduxStoreModel) {
    return {
        User: state.User,
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(UnauthorizedComponent);
