import { KeyMapper, Omit, StringNum } from "../core/CoreTypes";

/**
 * WARNING!
 *
 * Some of the classes and type definitions in this class are sensitive to being moved around
 * This includes moving them out of this file and/or moving the *around* in the file
 *
 * RouteUrl must be defined first after the types and the static constructor must be the very last item
 *
 * **Do not have any routes below the Routes static constructor**
 */

/** Takes all keys from **Routes**, removing 2 (prototype + GET), returning the remaining keys with a type of string for each */
type T6 = KeyMapper<Omit<typeof Routes, "prototype" | "GET">, string>;

/**
 * The route containment class
 */
export class RouteUrl {
    /**
     * Returns the original URL provided before adding in the params
     */
    public readonly originalUrl: string;
    /**
     * Returns the original Params as an object
     */
    public readonly originalParams: { [index: string]: string };

    /**
     * Returns the route generated from the URL and Params
     */
    public ToRoute(): string {
        // Rick: We might be able to use react-router's 'generatePath()' instead
        // import { generatePath } from "react-router"
        return this.generateRoute();
    };

    /**
     * Creates an instance of RouteUrl
     * @example
     * // Simple
     * RouteUrl("/path/:id", { id });
     *
     * // Complicated. Notice the matching keys and url params
     * RouteUrl("/path/:foo/:bar/:baz?", { foo, bar: id, baz: "something" });
     *
     * @remarks
     * If params are in the URL and **not** passed into the params param, then the route is not parsed and will equal the url passed in
     *
     * @param {string} url The url as a React Router url string, see examples
     * @param {{}} [params] The params for the url as an object. Items must be keyed corresponding to their name in the url
     */
    constructor(url: string, params?: {}) {
        // Remove spaces from url
        this.originalUrl = url.replace(/(\r\n|\n|\r| )/gm, "");
        this.originalParams = params as { [index: string]: string };
    }

    private generateRoute(): string {
        // If we have no params, skip parsing.
        if (this.originalParams == null || this.originalParams === {}) {
            return this.originalUrl;
        }

        let paramKeys = Object.keys(this.originalParams);
        
        // Purely for readability on the return statement below
        let mapFunction = (split: string) => {
            let isOptional = false;

            // Check if variable or just string
            if (split[0] !== ":") {
                return split;
            }

            // Remove the ':' from the start of the key
            split = split.slice(1);

            // Check if required
            if (split.slice(-1) === "?") {
                isOptional = true;
                split = split.slice(0, -1);
            }

            // Check if params match. If not, optional params just get let through
            let key = paramKeys.find(y => y === split);
            if (key == null && isOptional) {
                return "";
            } else if (key == null) {
                key = "";
            }

            return this.originalParams[key];
        };

        return "/" + this.originalUrl
            .split("/") // Split into chunks
            .map(mapFunction) // Map params to variables
            .filter(x => x) // Remove empty
            .join("/"); // Join everything back together again
    }
}

export default class Routes {
    /** A transformed list containing all of the routes as strings, rather than functions. Useful for quick access
     *
     * Do **NOT** use .Replace() from here. That is *really bad*
     */
    public static GET: T6;

    /* General */
    public static BASE_ROUTE() { return new RouteUrl("/"); }

    public static LOGIN() { return new RouteUrl("/login"); }
    public static LOGOUT() { return new RouteUrl("/signout-oidc"); }
    // public static LOGGED_OUT() { return new RouteUrl("/logged-out"); }

    public static USER_BASE() { return new RouteUrl("/users"); }
    public static USER_EDIT(id: string) { return new RouteUrl("/users/edit/:id", { id }); }

    /* Error Handling */
    public static ERROR_PAGE() { return new RouteUrl("/the-handler"); }
    public static PROD_ERROR_PAGE() { return new RouteUrl("/errors"); }
    public static PAGE_NOT_FOUND() { return new RouteUrl("/404"); }
    public static UNAUTHORIZED() { return new RouteUrl("/unauthorized"); }

    /**
     * Static constructor for the static Routes class
     *
     * This **Must** be last. **DO NOT MOVE**
     */
    public static construct = (() => {
        let retrieve = function (key: string): string {
            let RoutesNoAny = Routes as any;
            // If function, run it and assume RouteUrl as a return type. Else, check for string and return its result
            if (typeof RoutesNoAny[key] === 'function') {
                let obj: RouteUrl = RoutesNoAny[key]({});
                if (obj != null) {
                    return obj.originalUrl;
                }
            } else if (typeof RoutesNoAny[key] === 'string') {
                return RoutesNoAny[key];
            }
            // Uh
            return "";
        };

        // Keys to be removed. Object functions, prototype and where we are storing the rest
        let spareKeys = ["name", "length", "construct", "prototype", "GET"];

        Routes.GET = Object.getOwnPropertyNames(Routes) // Get all properties including functions
            .filter(x => spareKeys.find(key => key === x) == null) // Remove some of those functions
            .map(x => ({ [x]: retrieve(x) })) // Get the string representation
            .reduce((a, b) => ({ ...a, ...b })) as T6; // Combine array into object
    })();
}
