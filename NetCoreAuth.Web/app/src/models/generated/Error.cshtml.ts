﻿
/** File has been generated by TypeWriter. Modifications will be overriden when the template is rendered */
// @ts-ignore
import * as moment from 'moment';
import InterfaceConstructor from '../InterfaceConstructor';
import PageModel from './PageModel';

interface ErrorModel extends PageModel { 
    requestId: string | null;
    showRequestId: boolean;
}
const ErrorModel: InterfaceConstructor<ErrorModel> = {
    create: (initValues?: {} | null | undefined) => {
        return Object.assign(PageModel.create(),
        {
            requestId: null,
            showRequestId: false,
        },
        initValues);
    }
};

export default ErrorModel;