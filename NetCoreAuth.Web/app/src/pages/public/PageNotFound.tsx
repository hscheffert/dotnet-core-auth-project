import * as React from 'react';
import { Link } from 'react-router-dom';
import { bindAllOfThis } from 'utils';
import Routes from 'config/ConfigureRoutes';
import { PageProps } from 'models/frontend/common/ComponentProps';

interface PageNotFoundProps extends PageProps<{}> {
}

class PageNotFound extends React.Component<PageNotFoundProps> {
    constructor(props: PageNotFoundProps) {
        super(props);
        bindAllOfThis(this, PageNotFound.prototype);
    }

    render() {
        return <div style={{ backgroundColor: "white" }}>
            <h1>404</h1>
            <p>Woops! Nothing here.</p>
            <p>Go back <Link to={Routes.GET.BASE_ROUTE}>Home</Link></p>
        </div>;
    }
}

export default PageNotFound;
