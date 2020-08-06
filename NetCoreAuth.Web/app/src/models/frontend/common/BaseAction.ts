
/**
 * A base class of all Redux Actions used in this app. This ensures that all Actions are implemented in a similar fashion
 */
export default interface BaseAction {
    /**
     * Something such as 'INCREMENT_COUNT_USER' where the last '_something' is the name of the reducer family
     */
    type: string;
    /**
     * The data to be passed into the reducer. This does not need to be populated. This can also be overridden in the extending class
     *
     *    interface FunAction extends BaseAction { type: 'SET_FUN'; data: number; }
     * or
     *
     *    interface FunAction extends BaseAction { type: 'SET_FUN'; data: FunModel; }
     */
    data?: {};
}
