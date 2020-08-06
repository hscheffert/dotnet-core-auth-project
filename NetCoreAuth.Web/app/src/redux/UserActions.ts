import { Dispatch } from 'redux';
import { AxiosResponse, AxiosError } from 'axios';
import BaseAction from 'models/frontend/common/BaseAction';
import { LoadingStatusType } from 'models/frontend/common/LoadingStatusType';
import UserDTO from 'models/generated/UserDTO';
import ActionResultDTO from 'models/frontend/common/ActionResultDTO';
// import AuthController from 'api/AuthController';
import AccountApiController from 'api/AccountApiController';
import LoginDTO from 'models/generated/LoginDTO';

export interface LoginUserAction extends BaseAction { type: 'LOGIN_USER'; data: UserDTO; }
export interface ClearLoginUserAction extends BaseAction { type: 'CLEAR_LOGIN_STATE'; }
export interface UpdateUserAction extends BaseAction { type: 'UPDATE_USER'; data: UserDTO; }
export interface UpdateUserStateAction extends BaseAction { type: 'UPDATE_USER_STATE'; data: LoadingStatusType; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
// JB: You have to have atleast 2 in here for everything to work. It's a typescript thing
export type KnownActions = LoginUserAction | ClearLoginUserAction | UpdateUserAction | UpdateUserStateAction;

export default class UserAction {
    constructor() {
        // Dont be that guy
        throw new Error("NOOOO");
    }

    public static Login(dispatch: Dispatch<KnownActions>, dto: LoginDTO): Promise<ActionResultDTO> {
        dispatch({ type: "UPDATE_USER_STATE", data: "loading" } as UpdateUserStateAction);

        return AccountApiController.login(dto)
            .then(result => this.Login_OnSuccess(dispatch, result as any))
            .catch(error => this.Login_OnFailure(dispatch, error));
    }

    /**
     * Login using the browser cookie. This will run through the login process as if we had logged in
     */
    public static SoftLogin(dispatch: Dispatch<KnownActions>) { //: Promise<ActionResultDTO> {
        dispatch({ type: "UPDATE_USER_STATE", data: "loading" } as UpdateUserStateAction);        
        return AccountApiController.getCurrentUserName()
            .then(result => this.Login_OnSuccess(dispatch, result as any))
            .catch(error => this.Login_OnFailure(dispatch, error));
    }

    private static Login_OnSuccess(dispatch: Dispatch<KnownActions>, response: AxiosResponse<UserDTO>): ActionResultDTO {
        console.log(response.data);
        const data = UserDTO.create({
            ...response.data
        });

        dispatch({ type: "LOGIN_USER", data: data } as LoginUserAction);
        dispatch({ type: "UPDATE_USER_STATE", data: "finished" } as UpdateUserStateAction);
        return { isError: false };
    }

    private static Login_OnFailure(dispatch: Dispatch<KnownActions>, error: any): ActionResultDTO {
        dispatch({ type: "CLEAR_LOGIN_STATE" } as ClearLoginUserAction);
        dispatch({ type: "UPDATE_USER_STATE", data: "failed" } as UpdateUserStateAction);

        return { isError: true, message: error.message };
    }

    public static Logout(dispatch: Dispatch<KnownActions>) {
        dispatch({ type: "UPDATE_USER_STATE", data: "loading" } as UpdateUserStateAction);
        return AccountApiController.logout()
            .then(result => this.Logout_OnComplete(dispatch))
            .catch(error => this.Login_OnFailure(dispatch, error));
    }

    private static Logout_OnComplete(dispatch: Dispatch<KnownActions>) {
        dispatch({ type: "CLEAR_LOGIN_STATE" } as ClearLoginUserAction);
        dispatch({ type: "UPDATE_USER_STATE", data: "none" } as UpdateUserStateAction);
    }
}
