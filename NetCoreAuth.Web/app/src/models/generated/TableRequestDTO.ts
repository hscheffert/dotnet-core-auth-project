﻿
/** File has been generated by TypeWriter. Modifications will be overriden when the template is rendered */
// @ts-ignore
import * as moment from 'moment';
import InterfaceConstructor from '../InterfaceConstructor';
import TableRequestFilterDTO from './TableRequestFilterDTO';

interface TableRequestDTO { 
    page: number;
    pageLength: number;
    sortField: string | null;
    sortOrder: string | null;
    globalFilter: string | null;
    echo: number;
    filters: TableRequestFilterDTO[] | null;
}
const TableRequestDTO: InterfaceConstructor<TableRequestDTO> = {
    create: (initValues?: {} | null | undefined) => {
        return Object.assign(
        {
            page: 0,
            pageLength: 0,
            sortField: null,
            sortOrder: null,
            globalFilter: null,
            echo: 0,
            filters: [],
        },
        initValues);
    }
};

export default TableRequestDTO;
