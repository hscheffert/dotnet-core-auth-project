// SOURCE: https://github.com/oklas/react-breadcrumbs-dynamic/blob/master/src/index.js

import * as React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import {
    createAdvAgent,
    throughContainer,
    // @ts-ignore
} from 'react-through';

const breadcrumbsThroughArea = 'breadcrumbs';

const breadcrumbsBearingKey = 'name';

const withBreadcrumbsContainer = throughContainer(breadcrumbsThroughArea);

export const BreadcrumbsItem = createAdvAgent(breadcrumbsThroughArea, breadcrumbsBearingKey);

const Breadcrumbs = (props: any) => {
    const data = props[breadcrumbsThroughArea];
    let crumbs = Object
        .keys(data)
        .map(k => data[k]);

    if (crumbs) {
        let crumbString =  crumbs.filter(c => c.children).map(c => Array.isArray(c.children) ? c.children.join('') : c.children).join(' / ');
        if(crumbString.length) {
            crumbString = ' - ' + crumbString;
        }
        
        document.title =
            'Task List' + crumbString;
    }

    return (
        <React.Fragment>
            {crumbs && crumbs.length > 0 ?
                <Breadcrumb style={{ margin: '0 0 16px 0'}}>
                    {crumbs.filter(c => c.children).map((crumb, index) =>
                        <Breadcrumb.Item key={crumb.name}>
                            {crumb.to && index !== crumbs.length - 1 ?
                                <Link to={crumb.to}>
                                    {crumb.icon}
                                    <span>{crumb.children}</span>
                                </Link> :
                                <React.Fragment>
                                    {crumb.icon}
                                    <span>{crumb.children}</span>
                                </React.Fragment>}
                        </Breadcrumb.Item>
                    )}
                </Breadcrumb>
                : null}
        </React.Fragment>
    );
};

export const GlobalBreadcrumb = withBreadcrumbsContainer(Breadcrumbs);
