import * as React from 'react';
import { Link } from 'react-router-dom';
import { Space, Button } from 'antd';
import UserAction from 'redux/UserActions';
import { UserState } from 'redux/UserReducer';
import { Dispatch, Action } from 'redux';
import ReduxStoreModel from 'redux/ReduxModel';
import { connect } from 'react-redux';

interface LoginProps {
    Login: () => void;
    User: UserState;
}

class Login extends React.Component<LoginProps, {}> {
    render() {
        return (
            <div style={{ padding: '24px' }}>
                <h2>Welcome</h2>
                <p>Please log in.</p>
                <Button type="primary" onClick={this.props.Login}>Login</Button>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch: Dispatch<Action>) {
    return ({
       // Login: () => UserAction.Login(dispatch)
    });
}

function mapStateToProps(state: ReduxStoreModel) {
    return {
        User: state.User,
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(Login);
