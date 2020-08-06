import InterfaceConstructor from './InterfaceConstructor';
// @ts-ignore
import { ColumnType } from 'src/pages/shared/DataTable';

interface TableColumnState {
    columnProp: string;
    columnType?: ColumnType;
    initialSearchValue: string | boolean | null;
    filterVisible: boolean | undefined;
    searchText: string | null;
    filtered: boolean | undefined;
    renderDataTransform: Function | undefined | null;
}

const TableColumnState: InterfaceConstructor<TableColumnState> = {
    create: (initValues?: {} | null | undefined) => {
        return Object.assign(
        {
            columnProp: '',
            initialSearchValue: null,
            filterVisible: false,
            searchText: null,
            filtered: false,
            renderDataTransform: null
        },
        initValues);
    }
};

export default TableColumnState;
