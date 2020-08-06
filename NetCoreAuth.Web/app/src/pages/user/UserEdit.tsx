import React from 'react'
import { RouteComponentProps } from 'react-router-dom';
import {
    notification,
    Spin,
    Form,
    Space,
    Input,
    Checkbox,
    Select,
} from 'antd';
import HistoryUtil from '../../utils/HistoryUtil';
import { FormInstance } from 'antd/lib/form';
import * as FormHelper from '../../utils/FormUtil';
// import UserApiController from 'api/UserApiController';
import UserDTO from 'models/generated/UserDTO';
import Routes from 'config/ConfigureRoutes';
import { BreadcrumbsItem } from 'pages/shared/GlobalBreadcrumb';

interface RouteParams {
    id: string;
}

interface UserEditState {
    id: string;
    loading: boolean;
    user: UserDTO;
    supervisors: UserDTO[];
}

class UserEdit extends React.Component<RouteComponentProps<RouteParams>, UserEditState> {
    private formRef: FormInstance | null | undefined;
    constructor(props: RouteComponentProps<RouteParams>) {
        super(props);
        const id = props.match == null ? '0' : props.match.params.id || '0';

        this.state = {
            loading: false,
            id,
            user: UserDTO.create(),
            supervisors: [],
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    renderForm() {
        const initialValues = this.getInitialValues();

        return (
            <Form
                ref={el => this.formRef = el}
                {...FormHelper.FormConstants.FormLayout}
                onFinish={this.onFinish}
                validateMessages={FormHelper.FormConstants.FormValidateMessages}
                initialValues={initialValues}>

                <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[FormHelper.FormConstants.FormRequiredRule]}>
                    <Input maxLength={50} />
                </Form.Item>

                <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[FormHelper.FormConstants.FormRequiredRule]}>
                    <Input maxLength={50} />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[FormHelper.FormConstants.FormRequiredRule]}>
                    <Input maxLength={100} />
                </Form.Item>

                <Form.Item
                    label="Is Supervisor"
                    name="isSupervisor"
                    valuePropName="checked">
                    <Checkbox />
                </Form.Item>

                <Form.Item
                    label="Supervisor"
                    name="supervisorId">
                    <Select allowClear={true}>
                        {this.state.supervisors.map(FormHelper.renderUserSelectOption)}
                    </Select>
                </Form.Item>

                {FormHelper.renderIsActiveFormItem()}
                {FormHelper.renderFormSaveButton()}
            </Form>
        );
    }

    render() {
        return (
            <Space direction="vertical" style={{ width: '100%' }} size={'small'}>
                <BreadcrumbsItem name="user_edit">
                    {this.state.id !== '0' ? 'Edit User' : 'New User'}
                </BreadcrumbsItem>

                <Spin spinning={this.state.loading}>
                    {this.renderForm()}
                </Spin>
            </Space>
        );
    }

    private fetchData = async () => {
        // let promises = [];

        // this.setState({ loading: true });

        // if (this.state.id !== '0') {
        //     promises.push(UserApiController.get(this.state.id));
        // } else {
        //     promises.push(Promise.resolve(null));
        // }

        // if (!this.state.supervisors.length) {
        //     promises.push(UserApiController.getActiveSupervisors());
        // }

        // try {
        //     const [userResponse, supervisorsResponse] = await Promise.all(promises);
        //     const userState = userResponse ? { user: userResponse.data } : {};
        //     const supervisorsState = supervisorsResponse ? { supervisors: supervisorsResponse.data } : {};

        //     this.setState({
        //         loading: false,
        //         ...userState,
        //         ...supervisorsState
        //     } as UserEditState,
        //         this.ensureDropdownsHaveProperValues);

        //     this.formRef.setFieldsValue({
        //         ...userState.user,
        //     });
        // } catch (err) {
        //     this.setState({ loading: false });
        //     console.log(err.message, err.response);
        //     notification.error({
        //         message: err.message,
        //         description: err.description
        //     });
        // }
    }    

    private onFinish = (values: any) => {
        const dto = UserDTO.create({
            ...values,
            userId: this.state.id !== '0' ? this.state.id : undefined
        });

        this.saveUser(dto);
    }

    private getInitialValues = () => {
        if (this.state.id === '0') {
            return {
                isActive: true
            };
        }

        const { user } = this.state;

        return {
            name: user.name,
            isActive: user.isActive,
        };
    }

    private saveUser = async (dto: UserDTO) => {
        // this.setState({ loading: true });
        // try {
        //     const result = await UserApiController.post(dto);

        //     this.setState({ loading: false });
        //     HistoryUtil.push(Routes.GET.USER_BASE);
        // } catch (err) {
        //     this.setState({ loading: false });
        //     console.log(err.message, err.response);
        //     notification.error({
        //         message: err.message,
        //         description: err.description
        //     });
        // }
    }

    private ensureDropdownsHaveProperValues = () => {
        const { supervisors, user } = this.state;

        if(this.state.id === '0') {
            return;
        }

        // If the user has a supervisor and that supervisor is not in the list of active supervisors, we have to add it manually (otherwise their guid will just appear)
        if (supervisors.length && user?.supervisorId) {
            const userSupervisor = supervisors.find((u: UserDTO) => u.userId === user.supervisorId);

            if (!userSupervisor) {
                this.fetchSupervisor(user.supervisorId);
            }
        }
    }

    private fetchSupervisor = async (supervisorId: string) => {
        // this.setState({ loading: true });
        // try {
        //     const result = await UserApiController.get(supervisorId);

        //     this.setState({
        //         loading: false,
        //         supervisors: [result.data, ...this.state.supervisors]
        //     });
        // } catch (err) {
        //     this.setState({ loading: false });
        //     console.log(err.message, err.response);
        //     notification.error({
        //         message: err.message,
        //         description: err.description
        //     });
        // }
    }
}

export default UserEdit;