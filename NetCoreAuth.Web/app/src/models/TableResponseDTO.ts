﻿// Models TypeScript files should be AUTO-GENERATED by the Typewriter Visual Studio plugin. Do not modify this file.
// @ts-ignore
import * as moment from 'moment';
import InterfaceConstructor from './InterfaceConstructor';

interface TableResponseDTO<T> { 
    totalCount: number;
    filteredCount: number;
    echo: number;
    sumResult: T | null;
    results: T[] | null;
}
const TableResponseDTO: InterfaceConstructor<TableResponseDTO<any>> = {
    create: (initValues?: {} | null | undefined) => {
        return Object.assign(
        {
            totalCount: 0,
            filteredCount: 0,
            echo: 0,
            sumResult: null,
            results: [],
        },
        initValues);
    }
};

export default TableResponseDTO;
