import * as H from 'history';
import { match } from 'react-router-dom';

/**
 * Props passed into a page-level component.
 *
 * Usage:
 *
 *    interface FunPageProps extends PageProps<{}>
 *    interface FunPageProps extends PageProps<{itemId: number}>
 * These params can then be used as such
 *
 *    let itemId = this.props.match.params.id;
 *
 * @template UrlParams: An object of the params you are going to accept, does not need to be defined as an interface. Eg, {userId?: string}
 */
export interface PageProps<UrlParams> {
    /**
     * The browser URL object. **.search** contains the query params as a string '?foo=bar', while **.match** *should* have the
     * Yet another way to get the url. 'Search' contains only the '?foo=bar' raw text from the url
     */
    match: match<UrlParams>;

    /**
     * The browser URL object
     */
    location: LocationDescriptor;

    /**
     * Allows the control of History. This is provided by redux-router
     */
    history: H.History;
}

// Exists purely to give comments for the location object in PageProps
export interface LocationDescriptor {
    /**
     * The key for the location. Changes on render()
     */
    key?: string;

    /**
     * The path of this location after the TLD
     *
     * Eg. for 'example.org/somewhere?foo=bar#heading2', this would return '/somewhere'
     */
    pathname: string;

    /**
     * The query params of this location
     *
     * Eg. for 'example.org/somewhere?foo=bar#heading2', this would return '?foo=bar'
     */
    search: string;

    /**
     * The hash portion of this location
     *
     * Eg. for 'example.org/somewhere?foo=bar#heading2', this would return '#heading2'
     */
    hash: string;

    /**
     * **Be careful and use sparingly**
     *
     * Extremely useful tool for passing state between pages. Also, a useful tool for causing strange behavior between pages that are not aware of this
     */
    state: object;
}
