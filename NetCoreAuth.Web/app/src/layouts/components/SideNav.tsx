import * as React from 'react';
import { Menu, Layout } from 'antd';
import { NavLink } from 'react-router-dom';
import HistoryUtil from 'utils/HistoryUtil';
import Routes from 'config/ConfigureRoutes';
import { UserState } from 'redux/UserReducer';
import ReduxStoreModel from 'redux/ReduxModel';
import { connect } from 'react-redux';

const { Sider } = Layout;

interface SideNavProps {
    User: UserState;
}

interface SideNavState {
    current: string;
}

class SideNav extends React.Component<SideNavProps, SideNavState> {
    private homeUrl: string;
    private usersUrl: string;

    constructor(props: SideNavProps) {
        super(props);
        this.homeUrl = Routes.GET.BASE_ROUTE;
        this.usersUrl = Routes.GET.USER_BASE;

        this.state = { current: this.getSelectedNavItem(HistoryUtil.location.pathname) };

        HistoryUtil.listen((location) => {
            this.setState({
                current: this.getSelectedNavItem(location.pathname)
            });
        });
    }

    handleClick = (e: any) => {
        this.setState({
            current: e.key,
        });
    }

    renderAdminOnlyMenuItems = () => {
        const items = [          
            { key: 'users', url: this.usersUrl, name: 'Users' }
        ];
        
        return items.map(item => (
            <Menu.Item key={item.key}>
                <NavLink to={item.url}>
                    {item.name}
                </NavLink>
            </Menu.Item>
        ));
    }

    render() {
        const isAdmin = this.props.User.isAdmin;
        const selectedKeys = [this.state.current];        

        return (
            <Sider width={200} className="sider">
                <Menu
                    onClick={this.handleClick}
                    mode="inline"
                    defaultSelectedKeys={['home']}
                    selectedKeys={selectedKeys}
                    style={{ height: '100%', borderRight: 0 }}>
                    <Menu.Item key="home">
                        <NavLink to={this.homeUrl}>
                            Home
                        </NavLink>
                    </Menu.Item>
                    {isAdmin && this.renderAdminOnlyMenuItems()}
                </Menu>
            </Sider>
        );
    }

    private getSelectedNavItem(location: string): string {
        const initialLocation = location;
        let selectedItem = '';

        if (initialLocation.indexOf(this.usersUrl) >= 0) {
            selectedItem = 'users';
        } else {
            selectedItem = 'home';
        }

        return selectedItem;
    }
}

function mapStateToProps(state: ReduxStoreModel) {
    return {
        User: state.User,
    };
}

export default connect(mapStateToProps)(SideNav);
