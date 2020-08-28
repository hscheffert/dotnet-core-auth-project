import React from 'react';
import { Space, notification, } from 'antd';
import HistoryUtil from '../../utils/HistoryUtil';
import UserApiController from 'api/UserApiController';
import UserDTO from 'models/generated/UserDTO';
import DataTable, { DataTableColumnProps, Filterer, Renderer } from '../shared/DataTable';
import DataTableUtil from '../../utils/DataTableUtil';
import Routes from 'config/ConfigureRoutes';

interface UserTableProps {
}

interface UserTableState {
  loading: boolean;
  data: UserDTO[];
}

class UserTable extends React.Component<UserTableProps, UserTableState> {
  private dataTable: DataTable<UserDTO>;

  constructor(props: UserTableProps) {
    super(props);
    this.state = {
      loading: false,
      data: [],
    };
  }

  componentDidMount() {  
    this.fetchData();
  }

  renderTable = () => {
    const addButton = DataTable.TableButtons.Add("Add User", Routes.USER_EDIT('0').ToRoute());

    return (
      <DataTable
        ref={(ele: any) => this.dataTable = ele}
        serverSide={false}
        tableProps={{
          rowKey: 'id',
          loading: this.state.loading,
          sortDirections: ['ascend', 'descend'],
        }}
        columns={this.getTableColumns()}
        data={this.state.data}
        globalSearch={true}
        buttonBar={[addButton]}
      />
    );
  }

  render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size={'small'}>
        {this.renderTable()}
      </Space>
    );
  }

  private fetchData = async () => {
    this.setState({ loading: true });
    try {
      const result = await UserApiController.getAll();

      this.setState({
        loading: false,
        data: result.data,
      });

      this.dataTable.refresh();
    } catch (err) {
      this.setState({ loading: false });
      console.log(err.message, err.response);
      notification.error({
        message: err.message,
        description: err.description
      });
    }
  }

  private editUser = (userId: string | null) => {
    HistoryUtil.push(Routes.USER_EDIT(userId).ToRoute());
  }

  private getTableColumns = () => {
    return [
      DataTable.StandardColumns.Text('Last Name', 'lastName', {
        columnProps: { defaultSortOrder: 'descend' }
      }),
      DataTable.StandardColumns.Text('First Name', 'firstName'),
      DataTable.StandardColumns.Text('Email', 'email'),
    ];
  }
}

export default UserTable;
