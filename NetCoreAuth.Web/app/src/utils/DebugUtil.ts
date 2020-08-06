export default class DebugUtil {
    /**
     * Checks if debug is enabled. Localhost will automatically set value to true
     *
     * Debug can be forcedly changed by setting the localStorage value 'debug' to 'true' or 'false'
     */
    public static isDebugEnabled(): boolean {
        let debugValue = this.GetDebugValue();
        let isDevHost = this.isDevHost();

        return debugValue === "set-true" || (debugValue !== "set-false" && isDevHost);
    }

    private static GetDebugValue(): "set-true" | "set-false" | "unset" {
        let item = localStorage.getItem("debug");
        if (item == null) {
            return "unset";
        } else if (item.toLowerCase() === "true") {
            return "set-true";
        }
        return "set-false";
    }

    private static isDevHost(): boolean {
        let currentShortUrl: string = (window.location.hostname || "").toLowerCase();
        let allowedUrls: string[] = ["localhost"];
        return allowedUrls.some(x => x.toLowerCase() === currentShortUrl);
    }

    /**
     * Gets the current environment from "". Takes into account the local storage override, which also requires debug to be set
     */
    public static GetCurrentEnvironment(): "development" | "production" {
        let environment = process.env.REACT_APP_ENVIRONMENT ?? "";

        if (environment.startsWith("prod")) {
            return "production";
        }
        return "development";
    }
}
