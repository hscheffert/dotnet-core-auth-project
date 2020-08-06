import React from 'react'
import {
    Button,
    Form,
    Input,
    Checkbox,
    InputNumber,
    Select
} from 'antd';

const FormLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 5 },
};
const FormSaveButtonLayout = {
    wrapperCol: { offset: FormLayout.labelCol.span, span: FormLayout.wrapperCol.span },
};
const FormValidateMessages = {
    required: '${label} is required'
};
const FormRequiredRule = { required: true };

export const FormConstants = {
    FormLayout,
    FormSaveButtonLayout,
    FormValidateMessages,
    FormRequiredRule,
};

export const renderNameFormItem = (maxLength: number = 50) => {
    return (
        <Form.Item
            label="Name"
            name="name"
            rules={[FormRequiredRule]}>
            <Input maxLength={maxLength} />
        </Form.Item>
    );
};

export const renderDisplayOrderFormItem = () => {
    return (
        <Form.Item
            label="Display Order"
            name="displayOrder"
            rules={[FormRequiredRule]}>
            <InputNumber />
        </Form.Item>
    );
};

export const renderIsActiveFormItem = () => {
    return (
        <Form.Item
            label="Is Active"
            name="isActive"
            valuePropName="checked">
            <Checkbox />
        </Form.Item>
    );
};

export const renderFormSaveButton = () => {
    return (
        <Form.Item {...FormSaveButtonLayout}>
            <Button type="primary" htmlType="submit">
                Save
            </Button>
        </Form.Item>
    );
};

export const renderUserSelectOption = (user: any) => {
    return (
        <Select.Option
            key={user.userId}
            value={user.userId}>
            {user.lastName + ', ' + user.firstName}
        </Select.Option>
    );
}