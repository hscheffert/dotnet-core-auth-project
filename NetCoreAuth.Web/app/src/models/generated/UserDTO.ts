﻿
/** File has been generated by TypeWriter. Modifications will be overriden when the template is rendered */
// @ts-ignore
import * as moment from 'moment';
import InterfaceConstructor from '../InterfaceConstructor';

interface UserDTO { 
    userId: string | null;
    name: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    isSupervisor: boolean;
    supervisorId: string | null;
    isActive: boolean;
    supervisorName: string | null;
}
const UserDTO: InterfaceConstructor<UserDTO> = {
    create: (initValues?: {} | null | undefined) => {
        return Object.assign(
        {
            userId: "00000000-0000-0000-0000-000000000000",
            name: null,
            email: null,
            firstName: null,
            lastName: null,
            isSupervisor: false,
            supervisorId: null,
            isActive: false,
            supervisorName: null,
        },
        initValues);
    }
};

export default UserDTO;