const reactLifecycleFunctions: string[] = ["componentWillMount", "componentDidMount", "componentWillReceiveProps", "shouldComponentUpdate", "componentWillUpdate", "componentDidUpdate", "componentWillUnmount", "componentDidCatch"];
const reactComponentFunctions: string[] = ["setState", "forceUpdate", "render"];
const functionFunctions: string[] = Object.getOwnPropertyNames(Function.prototype);

/**
 * Binds the 'this' context to a given class's functions. This saves you from writing binding code for all functions. Eg, `this.foo = this.foo.bind(this)`.
 *
 * **Note: React lifecycle, component and object functions are ignored.**
 *
 * Usage:
 *
 *    bindAllOfThis(this, YourClass.prototype);
 * @param currentClass This is the current class and will be used for the 'this' context. This will also provide the function list if functionsToBind is empty.
 * @param prototype The prototype of a given class. This is where we are going to get the function list.
 * @param functionsToIgnore The list of functions to ignore. This should not include any react or object functions. Those are already ignored.
 */
export default function bindAllOfThis(currentClass: any, prototype: any, functionsToIgnore: string[] = []) {
    if (currentClass == null || prototype == null) {
        return;
    }
    bindAllOfThisTheHardWay(currentClass, Object.getOwnPropertyNames(prototype), functionsToIgnore);
}

/**
 * Binds the 'this' context to a given class's functions. This is the extended version and contains more options
 *
 * Note: React lifecycle, component and object functions are ignored.
 *
 * Usage: bindAllOfThis(this);
 * @param currentClass This is the current class and will be used for the 'this' context. This will also provide the function list if functionsToBind is empty.
 * @param functionsToBind The list of functions to bind 'this' to. Useful when you are inheriting in a weird way.
 * @param functionsToIgnore The list of functions to ignore. This should not include any react or object functions. Those are already ignored.
 */
export function bindAllOfThisTheHardWay(currentClass: any, functionsToBind?: (string | Function)[], functionsToIgnore: string[] = []) {
    if (currentClass == null) {
        // no
        return;
    }
    if (functionsToBind == null || functionsToBind.length < 1) {
        // Im about 80% sure this branch isn't tested
        console.warn("If this ends up working or breaking, please contact me");
        functionsToBind = Object.getOwnPropertyNames(currentClass);
    }

    const ignoredFunctions: string[] = [...reactLifecycleFunctions, ...reactComponentFunctions, ...functionFunctions, ...functionsToIgnore]
        .filter(x => x); // Remove Empty Elements

    functionsToBind.forEach(functionName => {
        // Check if functionName is actually the function and not the name. You must have ES6 as the compiler
        if (typeof (functionName) === 'function') {
            if ((functionName as Function).name == null) {
                // Sorry, you need to compile for ES6 in your tsconfig
                return;
            }
            // If .name exists, functionName is actually a function of some kind
            functionName = (functionName as Function).name;
        }
        // Check if function name is in the ignored list
        if (ignoredFunctions.findIndex(x => x === functionName) === -1) {
            if (currentClass[functionName]["bind"] == null) {
                // Cannot find bind, which is usually getters/setters. We don't want to mess with those
                return;
            }
            currentClass[functionName] = currentClass[functionName].bind(currentClass);
        }
    });
}
