import * as React from 'react';
import { Row, Button, Input, Form } from 'antd';
import { bindAllOfThis } from 'utils';

import LoginDTO from 'models/generated/LoginDTO';
import FormItem from 'antd/lib/form/FormItem';
import { FormInstance } from 'antd/lib/form';

interface LoginFormProps {
    onSubmit: (data: LoginDTO) => void;
    isSubmitting: boolean;
}

interface LoginFormState {
}

class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
    private form: FormInstance;
    constructor(props: LoginFormProps) {
        super(props);
        bindAllOfThis(this, LoginForm.prototype);

        this.state = {
        };
    }

    handleFormSubmit = (values: any) => {                
        this.props.onSubmit(LoginDTO.create({
            email: values.email,
            password: values.password
        }));
    }

    render() {
        return <Form layout="vertical"
            ref={el => this.form = el}
            onFinish={this.handleFormSubmit}>
            <FormItem
                label="Email"
                name={"email"}
                rules={[{ required: true, message: 'Email is required.' }]}
            >
                <Input size="large" placeholder="Email" />
            </FormItem>

            <FormItem
                label="Password"
                name={"password"}
                rules={[{ required: true, message: 'Password is required.' }]}
            >
                <Input size="large" type="password" aria-label="Password" placeholder="Password" />
            </FormItem>

            <Row>
                <Button type="primary" htmlType="submit" className="login-form-button" size="large" loading={this.props.isSubmitting}>
                    Login
                </Button>
            </Row>
        </Form>;
    }
}

export default LoginForm;
