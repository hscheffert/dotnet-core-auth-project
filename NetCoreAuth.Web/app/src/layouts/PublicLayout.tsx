import * as React from 'react';
import { Layout } from 'antd';
import { bindAllOfThis } from 'utils';
import SimpleHeader from './components/SimpleHeader';

const { Content } = Layout;

interface PublicLayoutProps {
}

interface PublicLayoutState {
}

class PublicLayout extends React.Component<PublicLayoutProps, {}>  {
    constructor(props: PublicLayoutProps) {
        super(props);
        bindAllOfThis(this, PublicLayout.prototype);

        this.state = {};
    }

    public render() {
        return <Layout className="public-layout">
            <SimpleHeader />
            <Content>
                <div id="special"></div>
                {this.props.children}
            </Content>
        </Layout>;
    }
}

export default PublicLayout;
