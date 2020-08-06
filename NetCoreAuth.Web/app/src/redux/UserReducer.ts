import { Reducer } from 'redux';
import { KnownActions } from './UserActions';
import { LoadingStatusType } from 'models/frontend/common/LoadingStatusType';

export type UserState = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    /** Quick access to whether or not the user has logged in */
    isLoggedIn: boolean;

    /** Gives a current state of the User object */
    state: LoadingStatusType;
};

let DefaultUserState: UserState = {
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    state: "none",
    isAdmin: false,
    isLoggedIn: false
};

export const UserReducer: Reducer<UserState, KnownActions> = (state: UserState = DefaultUserState, action: KnownActions): UserState => {
    switch (action.type) {
        case "LOGIN_USER":
            return {
                ...state,
                id: action.data.userId,
                email: action.data.email,
                firstName: action.data.firstName,
                lastName: action.data.lastName,
                isAdmin: action.data.isSupervisor,
                isLoggedIn: true
            };
        case "CLEAR_LOGIN_STATE":
            return {
                ...state,
                ...DefaultUserState,
            };
        case "UPDATE_USER":
            return {
                ...state,
                id: action.data.userId,
                email: action.data.email,
                firstName: action.data.firstName,
                lastName: action.data.lastName,
                isAdmin: action.data.isSupervisor,
                isLoggedIn: true,
            };
        case "UPDATE_USER_STATE":
            return {
                ...state,
                state: action.data
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            // JB - Clarification: The following line is magic
            // eslint-disable-next-line
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    // (or default initial state if none was supplied)
    return state;
};
