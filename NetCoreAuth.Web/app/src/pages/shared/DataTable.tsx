import moment from 'moment';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import HistoryUtil from '../../utils/HistoryUtil';
import NumberInput from './NumberInput';
import Renderers from '../../utils/Renderers';
import TableColumnState from '../../models/TableColumnState';
import TableRequestDTO from '../../models/generated/TableRequestDTO';
import TableRequestFilterDTO from '../../models/generated/TableRequestFilterDTO';
import TableResponseDTO from '../../models/generated/TableResponseDTO';
import Time24Hour from './Time24Hour';
import {
    Button,
    Checkbox,
    DatePicker,
    Form,
    Input,
    notification,
    Radio,
    Table,
    Typography
} from 'antd';
import { ButtonProps, ButtonType } from 'antd/lib/button';
import {
    CheckOutlined,
    CloseOutlined,
    EditOutlined,
    FilterFilled,
    FilterOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { ColumnProps, TableProps, TablePaginationConfig } from 'antd/lib/table/';
import { FormInstance, Rule } from 'antd/lib/form';
import { isArray } from 'util';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
// import './DataTable.less';
import './DataTable.scss';

const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

// var debounce = require('lodash/debounce');

// ******************************************************* //
// TODO
// Sorting functions
// ******************************************************* //

export enum Renderer {
    DEFAULT,
    BooleanYesNo,
    BooleanYesEmpty,
    BooleanCheckbox,
    ShortDate,
    ShortTime,
    LongDate,
    DateTime,
    Currency,
    Percentage,
    TwoDecimalPlaces,
    LinkButtons
}

export enum Filterer {
    NONE,
    Text,
    Date,
    DateRange,
    DropdownSingle,
    DropdownMulti,
    BooleanCheckbox,
    BooleanRadio
}

export enum ColumnType {
    Text = 1,
    Date,
    Number,
    Boolean
}

export enum EditType {
    Hidden,
    Text,
    Date,
    Time,
    Number,
    Dropdown,
    BooleanCheckbox,
    BooleanToggle,
    BooleanRadio,
    CUSTOM
}

// TODO: don't know how to use this properly yet
export interface DataTableData {
    isTotalRow: boolean;
}

export interface ColumnEditOptions<T> {
    editable: boolean;
    disabled?: boolean;
    required?: boolean;
    type?: EditType;
    decimalPrecision?: number;
    dropdownOptions?: { text: string, value: string }[];
    inputStyle?: React.CSSProperties;
    inputClass?: string;
    placeholder?: string;
    onChange?: (value: any, form: React.RefObject<FormInstance>) => void;
    rules?: Rule[];
    customEditor?: (form: FormInstance, record: any, props: any) => any;
    additional?: any;
}

export interface DataTableStyleOptions {
    bordered?: boolean;
    alternatingRowHighlight?: boolean;
    compact?: boolean;
}

export interface DataTableColumnProps<T> {
    renderer?: Renderer;
    filterType?: Filterer;
    columnType?: ColumnType;
    dropdownFilterOptions?: { text: string, value: any }[];
    editOptions?: ColumnEditOptions<T>;
    renderDataTransform?: (value: any, record: T) => any;
    initialFilterValue?: string | boolean | undefined | null;
    columnProps: ColumnProps<T>;
    sumRender?: (text: any, record?: T) => any;
    showSum?: boolean;
}

export interface DataTableProps<T> {
    serverSide?: boolean;
    data: T[];
    fetchData?: (requestState: TableRequestDTO, checkEcho: () => boolean, callback: (response: TableResponseDTO<T>) => void) => any;
    columns: DataTableColumnProps<T>[];
    title?: string | JSX.Element;
    buttonBar?: DataTableButton[];
    tableProps: TableProps<T>;
    stateSaving?: {
        enabled: boolean,
        tableUniqueKey: string,
        perSession?: boolean
    };
    editOptions?: {
        allowEdit?: boolean;
        fullTableEdit?: boolean;
        useIconButtons?: boolean;
        rowClickForEdit?: boolean;
        saveRow?: (record: T, editValues: T, callback: (success: boolean) => void) => void;
        cancelEdit?: () => void;
    };
    styleOptions?: DataTableStyleOptions;
    selectable?: boolean;
    // paginationPosition?: TablePaginationConfig;
    paginationConfig?: TablePaginationConfig;
    // 'top' | 'bottom' | 'both'; // 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
    showSum?: boolean;
    globalSearch?: boolean;
}

enum DataTableButtonType {
    Generic,
    Link,
    Export,
    Reset
}

// export interface DataTableButton<T> {
//     label: string;
//     onClick: (tableState: DataTableState<T>) => void;
// }
export class DataTableButton {
    label: string;
    title: string;
    buttonType: ButtonType;
    additional?: ButtonProps;
    onClick: () => void;
    protected dataTableButtonType: DataTableButtonType;
    constructor(label: string, onClick: () => void, type?: ButtonType, additional?: ButtonProps) {
        this.dataTableButtonType = DataTableButtonType.Generic;
        this.label = label;
        this.onClick = onClick;
        this.buttonType = type ? type : 'default';
        this.additional = additional;
    }

    getType() {
        return this.dataTableButtonType;
    }
}

export class DataTableButtonExportData extends DataTableButton {
    private request: (tableState: TableRequestDTO) => any;

    constructor(request: (tableState: TableRequestDTO) => any) {
        super('Export', () => console.log('export clicked'));
        this.dataTableButtonType = DataTableButtonType.Export;
        this.request = request;
    }

    execute(tableState: TableRequestDTO) {
        return this.request(tableState)
            .catch(function (error: string) {
                notification.error({
                    message: 'Download Failed!',
                    description: error
                });
            });
    }
}

// export interface DataTableButtonExportData extends DataTableButton {
//     url: string;
// }

export class DataTableButtonReset extends DataTableButton {
    constructor() {
        super('Reset', () => console.log('reset clicked'));
        this.dataTableButtonType = DataTableButtonType.Reset;
    }
}

export class DataTableButtonLink extends DataTableButton {
    private href: string;

    constructor(label: string, title: string, href: string, type?: ButtonType) {
        super(label, () => { /* nothing to do */ }, type);
        this.href = href;
        this.title = title;
        this.dataTableButtonType = DataTableButtonType.Link;
    }

    render() {
        return (
            <Button
                key={this.label}
                type={this.buttonType}
                title={this.title}
                onClick={() => HistoryUtil.push(this.href)}>
                {this.label}
            </Button>
        );
    }
}

export class DataTableButtonAdd extends DataTableButtonLink {
    constructor(title: string, href: string, type?: ButtonType) {
        super(title, title, href, type || 'primary');
    }
}

const EditableContext = React.createContext({} as FormInstance);

interface EditableRowProps {
    index: number;
    edit: (record: any, form?: FormInstance, index?: number, saveOnClickOutside?: boolean) => void;
    canEdit: boolean;
    record: any;
    className: string;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, edit, canEdit, record, className, ...props }: any) => {
    const [form] = Form.useForm();

    return (
        <Form form={form} component={false} initialValues={record}>
            <EditableContext.Provider value={form}>
                <tr {...props}
                    className={'editable-row ' + (className || '')}
                    onClick={(event) => {
                        // @ts-ignore
                        if (edit && canEdit && event && event.target.type === 'checkbox' && event.target.disabled !== true) {
                            setTimeout(() => edit(record, form, index, false), 0);
                        }
                    }}
                    onBlur={(event) => {
                        let parent = commonAncestor(event.target, event.relatedTarget);
                        // @ts-ignore
                        if (edit &&
                            canEdit &&
                            event &&
                            (event.target as any).type === 'text' &&
                            (event.target as any).disabled !== true &&
                            (!parent || (parent.nodeName !== 'TD' && parent.nodeName !== 'TR'))) {
                            setTimeout(() => edit(record, form, index, false), 0);
                        }
                    }}
                />
            </EditableContext.Provider>
        </Form>
    );
};

function parents(node: any) {
    var nodes = [node];
    for (; node; node = node.parentNode) {
        nodes.unshift(node);
    }
    return nodes;
}

function commonAncestor(node1: any, node2: any) {
    var parents1 = parents(node1);
    var parents2 = parents(node2);

    if (parents1[0] !== parents2[0]) {
        return null;
    }

    for (var i = 0; i < parents1.length; i++) {
        if (parents1[i] !== parents2[i]) {
            return parents1[i - 1];
        }
    }
}

const EditableFormRow = EditableRow;

interface EditableCellProps {
    index: number;
    edit: (record: any, form?: FormInstance, index?: number, saveOnClickOutside?: boolean) => void;
    canEdit: boolean;
    record: any;
    className?: string;
    editing: boolean;
    dataIndex: string | number | (string | number)[];
    title?: string;
    inputType?: EditType;
    inputStyle?: React.CSSProperties;
    inputClass?: string;
    inputSize?: 'small' | 'large' | 'default' | undefined;
    decimalPrecision?: number;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    renderDataTransform?: (value: any, record: any) => any;
    customEditor?: any; // (form: React.RefObject<FormInstance>, record: any, props: any) => any;
    additional?: any;
    onChange?: (value: any, form: FormInstance) => void;
    onEnter?: (form: FormInstance, record: any) => void;
    onEscape?: () => void;
}

let getRecordValue = (record: object, dataIndex: string | number | (string | number)[]) => {
    if (!record || !dataIndex) {
        return null;
    }

    let value = record;

    if (Array.isArray(dataIndex)) {
        // @ts-ignore
        dataIndex.forEach(d => { value = value[d]; });
    } else {
        // @ts-ignore
        value = record[dataIndex];
    }

    return value;
};

const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    inputStyle,
    inputClass,
    inputSize,
    decimalPrecision,
    placeholder,
    disabled,
    required,
    renderDataTransform,
    record,
    index,
    customEditor,
    additional,
    onChange,
    onEnter,
    onEscape,
    className,
    ...restProps
}) => {
    // SEE: https://ant.design/components/table/#components-table-demo-edit-row

    const form = useContext(EditableContext);
    let recordValue = getRecordValue(record, dataIndex);

    let editor: React.ReactElement;
    switch (inputType) {
        case EditType.Hidden:
            editor = (
                <React.Fragment>
                    <Input type="hidden" />
                    {recordValue}
                </React.Fragment>
            );
            break;
        case EditType.Number:
            editor = (
                <NumberInput
                    onChange={(value) => onChange ? onChange(value, form) : null}
                    onKeyUp={(e) => handleKeyUp(e)}
                    disabled={!!disabled}
                    precision={decimalPrecision}
                    placeholder={placeholder}
                    size={inputSize}
                    className={inputClass}
                    style={{ ...inputStyle }}
                    {...additional} />
            );
            break;
        case EditType.Time:
            editor = (
                <Time24Hour
                    onChange={(time) => onChange ? onChange(time, form) : null}
                    format="h:mm a"
                    minuteStep={15}
                    disabled={!!disabled}
                    size={inputSize}
                    className={inputClass}
                    style={{ ...inputStyle }}
                    {...additional}
                />
            );
            break;
        case EditType.BooleanCheckbox:
            editor = (
                <Checkbox
                    onChange={(e) => onChange ? onChange(e.target.checked, form) : null}
                    disabled={!!disabled}
                    className={inputClass}
                    style={{ ...inputStyle }}
                    {...additional} />
            );
            break;
        case EditType.CUSTOM:
            if (!customEditor) {
                console.error('CustomEditor Props not found.');
                editor = <span style={{ color: 'red' }}>Error</span>;
                break;
            }
            // editor = customEditor.getInput(recordValue, form, record, {
            editor = customEditor(form, record, {
                editing,
                dataIndex,
                title,
                inputType,
                inputStyle,
                inputClass,
                inputSize,
                decimalPrecision,
                placeholder,
                disabled,
                required,
                renderDataTransform,
                record,
                index,
                customEditor,
                additional,
                onChange,
                onEnter,
                onEscape,
                className,
                ...restProps
            });
            break;
        default:
            editor = (
                <Input
                    onChange={(e) => onChange ? onChange(e.target.value, form) : null}
                    // onPressEnter={(e) => onEnter(form, record)}
                    onKeyUp={(e) => handleKeyUp(e)}
                    disabled={!!disabled}
                    size={inputSize}
                    placeholder={placeholder}
                    className={inputClass}
                    style={{ ...inputStyle }}
                    {...additional} />);
    }

    let handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Enter':
                onEnter!(form, record);
                break;
            case 'Esc': // IE/Edge specific value
            case 'Escape':
                onEscape!();
                break;
            default:
                return;
        }
    };

    let valPropName = undefined;
    let displayComp = undefined;

    if (editing) {
        valPropName = 'value';
        if (inputType === EditType.BooleanCheckbox ||
            inputType === EditType.BooleanRadio ||
            inputType === EditType.BooleanToggle) {
            valPropName = 'checked';
        }

        if (inputType === EditType.CUSTOM) {
            if (!customEditor) {
                displayComp = <span style={{ color: 'red' }}>Error</span>;
            } else {
                displayComp = customEditor(form, record, {
                    onChange: onChange ? (e: any) => onChange(e.target.value, form) : null,
                    onKeyUp: (e: any) => handleKeyUp(e),
                    onPressEnter: () => onEnter!(form, record)
                }); // this.props);
            }
        } else {
            displayComp = (
                <FormItem
                    name={dataIndex}
                    style={{ margin: 0 }}
                    valuePropName={valPropName}
                    rules={[{ required: required, message: '*' }]}>
                    {editor}
                </FormItem>
            );
        }
    } else {
        displayComp = restProps.children;
    }

    return (
        <td className={(editing ? 'editable-cell ' : '') + (className || '')} {...restProps}>
            {record && record.isTotalRow && inputType !== EditType.CUSTOM ? <></> : displayComp}
        </td>
    );
};

export interface DataTablePaginationProps extends TablePaginationConfig {
    dataTableUnfilteredTotal?: number | undefined;
}

interface DataTableState<T> {
    pagination: DataTablePaginationProps;
    sumResult: T | null;
    sorter: { columnKey: string, field: string, order: string } | any;
    filters: TableRequestFilterDTO[];
    globalFilter: string | null;
    columnStates: TableColumnState[];
    data: T[];
    filteredData: T[] | null;
    editingRecord: T | null;
    editingIndex?: number | null;
}

class DataTable<T> extends React.Component<DataTableProps<T>, DataTableState<T>> {
    public static DefaultPageSize = 25;

    public static StandardColumns = {
        Text<T>(title: string, dataIndex: string, props?: DataTableColumnProps<T>): DataTableColumnProps<T> {
            var res = props || {} as DataTableColumnProps<T>;
            res.filterType = Filterer.Text;
            res.columnType = ColumnType.Text;
            res.columnProps = res.columnProps || {};
            res.columnProps.title = title;
            res.columnProps.dataIndex = dataIndex;
            res.columnProps.sorter = res.columnProps.sorter === undefined ? true : res.columnProps.sorter;
            return res;
        },
        Number<T>(title: string, dataIndex: string, precision?: 0 | 2 | 5, props?: DataTableColumnProps<T>): DataTableColumnProps<T> {
            var res = props || {} as DataTableColumnProps<T>;
            res.filterType = Filterer.Text;
            res.columnType = ColumnType.Number;
            res.columnProps = res.columnProps || {};
            res.columnProps.title = title;
            res.columnProps.dataIndex = dataIndex;
            res.columnProps.sorter = res.columnProps.sorter === undefined ? true : res.columnProps.sorter;            
             res.columnProps.render =
                 (value: number, record: T) =>
                     value || value === 0 ?
                         precision === 0 ? Math.round(value) :
                             precision === 2 ? parseFloat(value.toFixed(2)) :
                                 precision === 5 ? parseFloat(value.toFixed(5)) :
                                     value : '';
            res.columnProps.align = res.columnProps.align || 'right';
            return res;
        },
        Boolean<T>(
            title: string,
            dataIndex: string,
            filterType?: Filterer,
            renderer?: Renderer,
            props?: DataTableColumnProps<T>
        ): DataTableColumnProps<T> {
            var res = props || {} as DataTableColumnProps<T>;
            res.filterType = filterType ? filterType : Filterer.BooleanCheckbox;
            res.columnType = ColumnType.Boolean;
            res.renderer = renderer ? renderer : Renderer.BooleanCheckbox;
            res.columnProps = res.columnProps || {};
            res.columnProps.title = title;
            res.columnProps.dataIndex = dataIndex;
            res.columnProps.sorter = res.columnProps.sorter === undefined ? true : res.columnProps.sorter;
            return res;
        },
        Date<T>(title: string | React.ReactElement, dataIndex: string, props?: DataTableColumnProps<T>): DataTableColumnProps<T> {
            var res = props || {} as DataTableColumnProps<T>;
            res.filterType = Filterer.Date;
            res.columnType = ColumnType.Date;
            res.renderer = Renderer.ShortDate;
            res.columnProps = res.columnProps || {};
            res.columnProps.title = title;
            res.columnProps.dataIndex = dataIndex;
            res.columnProps.sorter = res.columnProps.sorter === undefined ? true : res.columnProps.sorter;
            res.columnProps.align = 'center';
            return res;
        },
        LinkButton<T>(
            title: string,
            key: string,
            transform: (value: any, record: T) => any,
            props?: DataTableColumnProps<T>
        ): DataTableColumnProps<T> {
            var res = props || {} as DataTableColumnProps<T>;
            res.renderer = Renderer.LinkButtons;
            res.renderDataTransform = (text, record) => transform(text, record);
            res.columnProps = res.columnProps || {};
            res.columnProps.title = title;
            res.columnProps.align = 'center';
            return res;
        },
        Link<T>(
            title: string,
            textField: string,
            transform: (value: any, record: T) => any, props?: DataTableColumnProps<T>
        ): DataTableColumnProps<T> {
            var res = props || {} as DataTableColumnProps<T>;
            // res.renderer = Renderer.Link;
            res.renderDataTransform = (text, record) => transform(text, record);
            res.columnProps = res.columnProps || {};
            res.columnProps.title = title;
            // @ts-ignore
            res.columnProps.render = (text: any, record: T, index: number) => <Link to={transform(text, record)}>{record[textField]}</Link>;
            return res;
        }
    };

    public static TableButtons: any = {
        Generic(title: string, onClick: () => any, additional?: ButtonProps): DataTableButton {
            return new DataTableButton(title, onClick, undefined, additional);
        },
        Primary(title: string, onClick: () => any, additional?: ButtonProps): DataTableButton {
            return new DataTableButton(title, onClick, 'primary', additional);
        },
        Danger(title: string, onClick: () => any, additional?: ButtonProps): DataTableButton {
            return new DataTableButton(title, onClick, 'danger' as ButtonType, additional);
        },
        Export(request: (tableState: TableRequestDTO) => any): DataTableButtonExportData {
            return new DataTableButtonExportData(request);
        },
        Reset(): DataTableButtonReset {
            return new DataTableButtonReset();
        },
        Link(label: string, title: string, href: string): DataTableButtonLink {
            return new DataTableButtonLink(label, title, href);
        },
        Add(title: string, href: string, type?: ButtonType): DataTableButtonAdd {
            return new DataTableButtonAdd(title, href, type);
        }
    };

    private searchInputs: any = {};
    private echo = 0;
    private editingRowForm: FormInstance;
    private selectedRowIds: any[] = [];

    constructor(props: DataTableProps<T>) {
        super(props);

        let $this = this;
        let tableState: DataTableState<T> = {} as any;
        if (props.stateSaving && props.stateSaving.enabled) {
            let tableStateStr =
                props.stateSaving.perSession ?
                    sessionStorage.getItem(this.getStateSavingTableKey()) :
                    localStorage.getItem(this.getStateSavingTableKey());
            if (tableStateStr) {
                tableState = JSON.parse(tableStateStr);

                let columnKeys = this.props.columns.map(c => c.columnProps.dataIndex || c.columnProps.key);
                if ((tableState.filters || []).some(f =>
                    !columnKeys.includes(f.columnProp || ''))) {
                    tableState = {} as any;
                } else if (tableState.sorter.columnKey && !columnKeys.includes(tableState.sorter.columnKey || '')) {
                    tableState = {} as any;
                } else if ((tableState.columnStates || []).some(f =>
                    !columnKeys.includes(f.columnProp || ''))) {
                    tableState = {} as any;
                }
            }
        }

        let defaultSorter: { columnKey: string, field: string, order: string } | any = {};
        if ((props.columns || []).some(c => c.columnProps.defaultSortOrder)) {
            let sortColumn = (this.props.columns || []).find(c => c.columnProps.defaultSortOrder);
            if (sortColumn) {
                defaultSorter.columnKey = sortColumn.columnProps.dataIndex || sortColumn.columnProps.key;
                defaultSorter.field = sortColumn.columnProps.dataIndex || sortColumn.columnProps.key;
                defaultSorter.order = sortColumn.columnProps.defaultSortOrder;
            }
        }

        this.state = {
            pagination:
                this.props.tableProps && this.props.tableProps.pagination === false ?
                    {
                        hideOnSinglePage: true,
                        pageSize: 1000000
                    } :
                    {
                        defaultPageSize: DataTable.DefaultPageSize,
                        pageSizeOptions: ['25', '50', '75', '100'],
                        defaultCurrent: 1,
                        position: this.props.paginationConfig?.position || ({ position: ['bottomCenter'] } as TablePaginationConfig).position,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total}
                        ${$this.state.pagination.dataTableUnfilteredTotal && $this.state.pagination.dataTableUnfilteredTotal !== total ?
                                'filtered from ' + $this.state.pagination.dataTableUnfilteredTotal + ' total' :
                                'total'}`
                    },
            sumResult: props.serverSide ? null : props.showSum ? this.getLocalSumResult(props.data) : null,
            sorter: props.stateSaving && props.stateSaving.enabled && tableState.sorter ? tableState.sorter : defaultSorter,
            filters: props.stateSaving && props.stateSaving.enabled && tableState.filters ?
                tableState.filters :
                this.props.columns
                    .filter(column => column.initialFilterValue !== null && column.initialFilterValue !== undefined)
                    .map(column => TableRequestFilterDTO.create({
                        columnProp: column.columnProps.dataIndex || column.columnProps.key,
                        filter: column.initialFilterValue
                    })),
            globalFilter: null, // Don't remember the global filter
            // globalFilter: props.stateSaving && props.stateSaving.enabled && tableState.globalFilter ? tableState.globalFilter : null,
            columnStates: props.stateSaving &&
                props.stateSaving.enabled &&
                tableState.columnStates &&
                tableState.columnStates.length === this.props.columns.length ?
                tableState.columnStates :
                this.props.columns.map(column => {
                    return TableColumnState.create({
                        columnProp: column.columnProps.dataIndex || column.columnProps.key,
                        columnType: column.columnType,
                        initialSearchValue: column.initialFilterValue,
                        searchText:
                            column.initialFilterValue !== null &&
                                column.initialFilterValue !== undefined ?
                                column.initialFilterValue as string :
                                '',
                        filtered: column.initialFilterValue !== null && column.initialFilterValue !== undefined,
                        renderDataTransform: column.renderDataTransform
                    });
                }),
            data: [],
            filteredData: null,
            editingRecord: null
        };

        // this.search = debounce(this.search, 400);
        this.handleTableChange = this.handleTableChange.bind(this);
    }

    componentDidMount() {
        if (this.props.serverSide) {
            this.callFetchData(this.state.pagination, this.state.filters, this.state.sorter, this.state.globalFilter);
        } else {
            this.setState({
                data: this.props.data
            });
        }
    }

    resetTable() {
        let pager = { ...this.state.pagination };
        pager.current = 1;

        let columnStates = this.state.columnStates.map(colState => {
            colState.filtered = colState.initialSearchValue !== null && colState.initialSearchValue !== undefined;
            colState.filterVisible = false;
            colState.searchText = colState.initialSearchValue !== null && colState.initialSearchValue !== undefined ?
                colState.initialSearchValue as string :
                '';
            return colState;
        });

        this.setState(
            {
                pagination: pager,
                sorter: {} as any,
                filters:
                    columnStates
                        .filter(column => column.initialSearchValue !== null && column.initialSearchValue !== undefined)
                        .map(column => TableRequestFilterDTO.create({
                            columnProp: column.columnProp,
                            filter: column.initialSearchValue
                        })),
                globalFilter: null,
                columnStates
            },
            () => this.refresh());

        this.saveTableState({}, [], columnStates, null);
    }

    getSelected() {
        return this.selectedRowIds;
    }

    refresh() {
        if (this.props.serverSide) {
            this.callFetchData(this.state.pagination, this.state.filters, this.state.sorter, this.state.globalFilter);
        } else {
            this.setState(
                {
                    data: this.props.data,
                    // filteredData: this.props.data
                    filteredData: null,
                    sumResult: this.getLocalSumResult(this.props.data),
                },
                () => {
                    this.state.columnStates.filter(colState => colState.filtered).forEach(colState => this.onSearch(colState));
                }
            );
        }
    }

    saveOnClickOutside = (form: FormInstance, record: T, index: number, callback?: (saved: boolean) => void) => {
        const outsideClickListener = (event: any) => {
            if (event.target.closest('.editable-row') === null) {
                if (this.state.editingRecord) {
                    this.save(form, record, index, callback);
                }

                // tslint:disable-next-line
                removeClickListener();
            }
        };

        const removeClickListener = () => {
            document.removeEventListener('click', outsideClickListener);
        };

        document.removeEventListener('click', outsideClickListener);
        document.addEventListener('click', outsideClickListener);
    }

    render() {
        var tableProps = { ...this.props.tableProps };
        tableProps.dataSource = this.state.filteredData || this.state.data;
        tableProps.pagination = this.state.pagination;
        tableProps.size = tableProps.size || 'small';
        tableProps.onChange = this.handleTableChange;

        let propColumns = this.props.columns.map(a => a);

        if (this.props.selectable === true) {
            propColumns = [this.getSelectColumn(), ...propColumns];
        }

        let columns = propColumns.map((col, index) => {

            if (!col.editOptions) {
                return col;
            }

            if (!col.editOptions.editable) {
                return col;
            }

            return {
                ...col,
                columnProps: { ...col.columnProps },
                index
            } as any;
        });

        // if (this.props.showSum && tableProps.dataSource.length > 0) {
        // if (this.props.showSum) {
        //     let sumResult = this.state.sumResult;
        //     if (sumResult) {
        //         tableProps.components = {
        //             body: {
        //                 wrapper: ({ ...p }) => {
        //                     return (
        //                         <tbody {...p}>
        //                             {<tr className="ant-table-row dtSumRow" key="sumRow">
        //                                 {
        //                                     !!p.rowSelection ? <td className="ant-table-selection-column" /> : null
        //                                 }
        //                                 {
        //                                     columns.map((column, i) => {
        //                                         let dataIndex = column.columnProps.dataIndex;
        //                                         let colKey = column.columnProps.key;
        //                                         let colAlign = column.columnProps.align;

        //                                         let text = sumResult && dataIndex ? sumResult[dataIndex] : undefined;
        //                                         if (column.sumRender) {
        //                                             text = column.sumRender(text, sumResult);
        //                                         } else if (column.columnType !== ColumnType.Number) {
        //                                             text = undefined;
        //                                         } else if (column.columnProps.render) {
        //                                             text = column.columnProps.render(text, sumResult);
        //                                         }

        //                                         return (
        //                                             <td key={`sumCol_${dataIndex || colKey}`} style={{ textAlign: colAlign }}>
        //                                                 {text}
        //                                             </td>
        //                                         );
        //                                     })
        //                                 }
        //                             </tr>}
        //                         </tbody>
        //                     );
        //                 }
        //             }
        //         };
        //     }
        // }

        // if ((!this.props.editOptions || this.props.editOptions && this.props.editOptions.allowEdit !== false) &&
        if (this.props.editOptions && this.props.columns.some(c => !!c.editOptions && c.editOptions.editable)) {
            let body: any = tableProps.components ? tableProps.components.body : {};
            tableProps.components = {
                ...tableProps.components,
                body: {
                    ...body,
                    row: EditableFormRow,
                    cell: EditableCell
                }
            };

            if (this.props.editOptions && this.props.editOptions.rowClickForEdit) {
                // tableProps.onRowClick = (record, index) => this.edit(record);
                // TODO: onRow
                // @ts-ignore
                tableProps.onRow = (record: T, index: number) => ({
                    record,
                    index,
                    edit: this.edit,
                    canEdit: this.props.editOptions && this.props.editOptions.allowEdit
                });
            } else if (this.props.editOptions && this.props.editOptions.fullTableEdit) {
                // TODO: onRow
                // @ts-ignore
                tableProps.onRow = (record: T, index: number) => ({
                    record,
                    index,
                    edit: this.edit,
                    canEdit: this.props.editOptions && this.props.editOptions.allowEdit
                });
            } else {
                columns.push({
                    columnProps: {
                        title: '',
                        dataIndex: 'actions',
                        render: (text: string, record: T, index: number) => {
                            const editable = this.isEditing(record);
                            return (
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    {editable ?
                                        <React.Fragment>
                                            <EditableContext.Consumer>
                                                {form => (
                                                    this.props.editOptions && this.props.editOptions.useIconButtons ?
                                                        <Button
                                                            size="small"
                                                            icon={<CheckOutlined />}
                                                            style={{ marginRight: 5 }}
                                                            title="Done"
                                                            shape="circle"
                                                            type="primary"
                                                            onClick={() => this.save(form, record, index)} /> :
                                                        <a
                                                            href="javascript:;"
                                                            onClick={() => this.save(form, record, index)}
                                                            style={{ marginRight: 5 }}>
                                                            Done
                                                        </a>
                                                )}
                                            </EditableContext.Consumer>
                                            {this.props.editOptions && this.props.editOptions.useIconButtons ?
                                                <Button
                                                    size="small"
                                                    icon={<CloseOutlined />}
                                                    shape="circle"
                                                    type={'danger' as ButtonType}
                                                    title="Cancel"
                                                    onClick={() => this.cancel()} /> :
                                                <a
                                                    href="javascript:;"
                                                    onClick={() => this.cancel()}>Cancel</a>}
                                        </React.Fragment>
                                        : (
                                            this.props.editOptions && this.props.editOptions.useIconButtons ?
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    shape="circle"
                                                    title="Edit"
                                                    onClick={() => this.edit(record, this.editingRowForm, index)} /> :
                                                <a onClick={() => this.edit(record, this.editingRowForm, index)}>Edit</a>
                                        )}
                                </div>
                            );
                        },
                    },
                });
            }
        }

        let compact = this.props.styleOptions ? this.props.styleOptions.compact : false;
        compact = false; // DISABLING THIS FOR NOW

        columns = columns.map(col => {
            if (!col.editOptions) {
                return col;
            }

            if (!col.editOptions.editable) {
                return col;
            }

            return {
                ...col,
                columnProps: {
                    ...col.columnProps,
                    onCell: (record: T) => ({
                        record,
                        inputType: col.editOptions ? col.editOptions.type : '',
                        dataIndex: col.columnProps.dataIndex,
                        title: col.columnProps.title,
                        // editing: this.isEditing(index),
                        inputStyle: col.editOptions ? col.editOptions.inputStyle : {},
                        inputClass: col.editOptions ? col.editOptions.inputClass : '',
                        inputSize: compact ? 'small' : undefined,
                        decimalPrecision: col.editOptions ? col.editOptions.decimalPrecision : undefined,
                        placeholder: col.editOptions ? col.editOptions.placeholder : undefined,
                        customEditor: col.editOptions ? col.editOptions.customEditor : null,
                        additional: col.editOptions ? col.editOptions.additional : null,
                        disabled: col.editOptions ? col.editOptions.disabled : false,
                        required: col.editOptions ? col.editOptions.required : false,
                        onChange: col.editOptions ? col.editOptions.onChange : null,
                        onEnter: this.save,
                        onEscape: this.cancel,
                        renderDataTransform: col.renderDataTransform
                    })
                }
            };
        });

        tableProps.columns = columns.map(column => {
            var columnProps = { ...column.columnProps };
            var columnState = this.getColumnState(column);

            // if (!column.columnProps.key) {
            //     column.columnProps.key = column.columnProps.dataIndex;
            // }
            let columnFilterValid: boolean = true;
            switch (column.filterType) {
                case Filterer.Text:
                    columnProps.filterDropdown = this.textFilter(columnState, column.columnProps.title);
                    columnProps.onFilterDropdownVisibleChange = this.onFilterVisibleChangeWithFocus(columnState);
                    break;
                case Filterer.Date:
                    columnProps.filterDropdown = this.dateFilter(columnState, column.columnProps.title);
                    columnProps.onFilterDropdownVisibleChange = this.onFilterVisibleChangeWithFocus(columnState);
                    break;
                case Filterer.DateRange:
                    columnProps.filterDropdown = this.dateRangeFilter(columnState, column.columnProps.title);
                    columnProps.onFilterDropdownVisibleChange = this.onFilterVisibleChangeWithFocus(columnState);
                    break;
                case Filterer.BooleanCheckbox:
                    columnProps.filterDropdown = this.booleanCheckboxFilter(columnState, column.columnProps.title);
                    columnProps.onFilterDropdownVisibleChange = this.onFilterVisibleChange(columnState);
                    break;
                case Filterer.BooleanRadio:
                    columnProps.filterDropdown = this.booleanRadioFilter(columnState, column.columnProps.title);
                    columnProps.onFilterDropdownVisibleChange = this.onFilterVisibleChange(columnState);
                    break;
                case Filterer.DropdownSingle:
                case Filterer.DropdownMulti:
                    if (!column.dropdownFilterOptions) {
                        console.error(`No Dropdown Options Provided for Dropdown Filter. Column: ${column.columnProps.title}`);
                        break;
                    }
                    columnProps.filterDropdown = this.dropdownFilter(columnState, column);
                    columnProps.onFilterDropdownVisibleChange = this.onFilterVisibleChange(columnState);
                    break;
                default:
                    columnFilterValid = false;
                    break;
            }

            if (columnFilterValid) {
                columnProps.filterDropdownVisible = columnState.filterVisible;
                columnProps.filterIcon = this.filterIcon(columnState);
            }

            columnProps.render = this.getColumnRenderer(column, columnProps.render);

            if (columnProps.sorter) {
                if (columnProps.sorter === true && !this.props.serverSide) {
                    columnProps.sorter = (a: T, b: T) => {
                        return columnProps.dataIndex ?
                            // @ts-ignore
                            ([a[columnProps.dataIndex], b[columnProps.dataIndex]].sort()[0] === a[columnProps.dataIndex] ? 1 : -1) :
                            0;
                        // a[columnProps.dataIndex].localeCompare(b[columnProps.dataIndex]);
                    };
                }
                columnProps.sortOrder = this.state.sorter.columnKey === columnProps.dataIndex && this.state.sorter.order;
            }

            if (column.editOptions && column.editOptions.editable) {
                columnProps.onCell = (record: T) => ({
                    record,
                    inputType: column.editOptions ? column.editOptions.type : '',
                    inputSize: compact ? 'small' : undefined,
                    dataIndex: column.columnProps.dataIndex,
                    title: column.columnProps.title,
                    editing: this.props.editOptions && this.props.editOptions.fullTableEdit ? true : this.isEditing(record),
                    inputStyle: column.editOptions ? column.editOptions.inputStyle : {},
                    inputClass: column.editOptions ? column.editOptions.inputClass : '',
                    decimalPrecision: column.editOptions ? column.editOptions.decimalPrecision : undefined,
                    placeholder: column.editOptions ? column.editOptions.placeholder : undefined,
                    customEditor: column.editOptions ? column.editOptions.customEditor : null,
                    additional: column.editOptions ? column.editOptions.additional : null,
                    disabled: column.editOptions ? column.editOptions.disabled : false,
                    onChange: column.editOptions ? column.editOptions.onChange : null,
                    onEnter: this.save,
                    onEscape: this.cancel,
                    renderDataTransform: column.renderDataTransform
                });
            }

            if (!columnProps.key) {
                columnProps.key = isArray(columnProps.dataIndex) ? columnProps.dataIndex.join() : columnProps.dataIndex;
            }

            return columnProps;
        });

        let { pagination, filters, sorter } = this.state;

        let classes = ['datatable'];
        if (this.props.styleOptions) {
            if (this.props.styleOptions.bordered) {
                classes.push('datatable-bordered');
            }
            if (this.props.styleOptions.alternatingRowHighlight) {
                classes.push('datatable-alternating-row');
            }
            if (this.props.styleOptions.compact) {
                classes.push('datatable-compact');
            }
            if (this.props.editOptions && this.props.editOptions.rowClickForEdit) {
                classes.push('cursor-hand');
            }
        }

        return (
            <div className={classes.join(' ')}>
                {this.props.title || this.props.buttonBar || this.props.globalSearch ?
                    <div className="datatable-header" style={{ display: 'flex' }}>
                        {this.props.title ? <Typography.Title level={3}>{this.props.title}</Typography.Title> : null}
                        {this.getGlobalSearch()}
                        {this.props.buttonBar ?
                            <div className="dataTable-button-bar">
                                {this.props.buttonBar.map(button => {
                                    switch (button.getType()) {
                                        case DataTableButtonType.Export:
                                            button.onClick =
                                                () => (button as DataTableButtonExportData).execute(
                                                    this.getTableStateDTO(pagination, filters, sorter, this.state.globalFilter));
                                            break;
                                        case DataTableButtonType.Reset:
                                            button.onClick = () => this.resetTable();
                                            break;
                                        case DataTableButtonType.Link:
                                            return (button as any).render();
                                        default:
                                            break;
                                    }

                                    return (
                                        <Button
                                            {...button.additional}
                                            key={button.label}
                                            type={button.buttonType}
                                            title={button.title}
                                            onClick={() => button.onClick()}>
                                            {button.label}
                                        </Button>);
                                })}
                            </div>
                            : null}
                    </div>
                    : null}
                <Table {...(tableProps as unknown as TableProps<object>)} />
            </div>
        );
    }

    private getColumnRenderer = (column: DataTableColumnProps<T>, current: any) => {
        switch (column.renderer) {
            case Renderer.BooleanYesNo:
                return (value: any, record: T) =>
                    Renderers.booleanYesNo(column.renderDataTransform ? column.renderDataTransform(value, record) : value);
            case Renderer.BooleanYesEmpty:
                return (value: any, record: T) =>
                    Renderers.booleanYesEmpty(column.renderDataTransform ? column.renderDataTransform(value, record) : value);
            case Renderer.BooleanCheckbox:
                return (value: any, record: T) =>
                    Renderers.booleanCheckbox(column.renderDataTransform ? column.renderDataTransform(value, record) : value);
            case Renderer.ShortDate:
                return (value: any, record: T) =>
                    Renderers.shortDate(column.renderDataTransform ? column.renderDataTransform(value, record) : value);
            case Renderer.ShortTime:
                return (value: any, record: T) =>
                    Renderers.shortTime(column.renderDataTransform ? column.renderDataTransform(value, record) : value);
            case Renderer.LongDate:
                return (value: any, record: T) =>
                    Renderers.longDate(column.renderDataTransform ? column.renderDataTransform(value, record) : value);
            case Renderer.DateTime:
                return (value: any, record: T) =>
                    Renderers.dateAndTime(column.renderDataTransform ? column.renderDataTransform(value, record) : value);
            case Renderer.Currency:
                return (value: any, record: T) =>
                    Renderers.currency(column.renderDataTransform ? column.renderDataTransform(value, record) : value);
            case Renderer.Percentage:
                return (value: any, record: T) =>
                    Renderers.percentage(column.renderDataTransform ? column.renderDataTransform(value, record) : value);
            case Renderer.TwoDecimalPlaces:
                return (value: any, record: T) =>
                    Renderers.decimal(column.renderDataTransform ? column.renderDataTransform(value, record) : value, 2);
            case Renderer.LinkButtons:
                return (value: any, record: T) =>
                    Renderers.linkButtons(column.renderDataTransform ? column.renderDataTransform(value, record) : value);
            default:
                if (!current) {
                    return (value: any, record: T) =>
                        column.renderDataTransform ? column.renderDataTransform(value, record) : value;
                }
                return current;
        }
    }

    private getRowKey(record: T, index: number) {

        return typeof this.props.tableProps.rowKey === 'function' ?
            this.props.tableProps.rowKey(record, index)
            :
            `${this.getObjectValueByPath(record, `${this.props.tableProps.rowKey || 'id'}`)}`;
    }

    private getObjectValueByPath = (o: any, s: string) => {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        var a = s.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in o) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    }

    private getSelectColumn() {
        // Update selectedrowIds, removing lines can cause odd behavior of title checkbox, make sure all ids are still in the dataset
        this.selectedRowIds = this.selectedRowIds.filter(key =>
            (this.state.filteredData || this.state.data).some((a, i) => this.getRowKey(a, i) === key));

        let checkedCount = this.selectedRowIds.length;
        let dataCount = (this.state.filteredData || this.state.data).length;

        return {
            columnProps: {
                title: (
                    <Checkbox
                        checked={checkedCount > 0 && checkedCount === dataCount}
                        indeterminate={checkedCount !== 0 && checkedCount !== dataCount}
                        onChange={(e) => {
                            var newSelected = this.selectedRowIds;
                            if (!e.target.checked) {
                                newSelected = [];
                            } else {
                                newSelected = (this.state.filteredData || this.state.data).map((a, i) => this.getRowKey(a, i));
                            }
                            this.selectedRowIds = newSelected;
                            this.forceUpdate();
                        }}
                    />
                ),
                dataIndex: 'selectColumn_box',
                render: (val: any, record: T, i: number) => {
                    var rowKey = this.getRowKey(record, i);
                    return (
                        <Checkbox
                            checked={this.selectedRowIds.indexOf(rowKey) !== -1}
                            onChange={(e) => {
                                var newSelected = this.selectedRowIds.filter(a => a !== rowKey);
                                if (e.target.checked) {
                                    newSelected.push(rowKey);
                                }
                                this.selectedRowIds = newSelected;
                                this.forceUpdate();
                            }}

                        />);
                },
                width: 20
            },
        } as DataTableColumnProps<T>;
    }

    private getStateSavingTableKey() {
        if (!this.props.stateSaving || !this.props.stateSaving.tableUniqueKey) {
            console.log('State saving unique table key not set!');
            return '';
        }

        return 'DataTable_' + this.props.stateSaving.tableUniqueKey;
    }

    private getGlobalSearch = () => {
        if (!this.props.globalSearch) {
            return null;
        }

        return (
            <Input.Search
                placeholder="Search"
                className="generic-filter"
                enterButton={<SearchOutlined />}
                size="middle"
                value={this.state.globalFilter || ''}
                onChange={(e: any) => this.setState({ globalFilter: e.target.value })}
                onPressEnter={() => this.onSearch()}
                onSearch={() => this.onSearch()}
                allowClear={true}
            />
        );
    }

    private callFetchData(pagination: any, filters: any, sorter: any, globalFilter: string | null) {
        if (this.props.fetchData) {
            let requestState =
                this.getTableStateDTO(
                    pagination,
                    filters,
                    sorter,
                    globalFilter
                );

            this.props.fetchData(
                requestState,
                () => requestState.echo === this.echo,
                (response) => {
                    const pager = { ...pagination };
                    pager.total = response.filteredCount;
                    pager.dataTableUnfilteredTotal = response.totalCount;
                    if (pager.pageSize * (pager.current - 1) > response.filteredCount) {
                        pager.current = 0;
                    }
                    this.setState({
                        data: response.results || [],
                        pagination: pager,
                        sumResult: response.sumResult,
                    });
                }
            );
        }
    }

    private handleTableChange(pagination: any, filters: any, sorter: any) {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        pager.pageSize = pagination.pageSize;

        this.setState({
            pagination: pager,
            sorter: sorter
        });

        this.callFetchData(pager, this.state.filters, sorter, this.state.globalFilter);

        if (this.props.stateSaving && this.props.stateSaving.enabled) {
            if (this.state.sorter.columnKey !== sorter.columnKey || this.state.sorter.order !== sorter.order) {
                this.saveTableState(
                    {
                        columnKey: sorter.columnKey,
                        field: sorter.field,
                        order: sorter.order
                    },
                    this.state.filters,
                    this.state.columnStates,
                    this.state.globalFilter
                );
            }
        }
    }

    private saveTableState(sorter: any, filters: any, columnStates: any, globalFilter: string | null) {
        if (this.props.stateSaving && this.props.stateSaving.enabled) {
            let data =
                JSON.stringify({
                    sorter,
                    filters,
                    columnStates,
                    globalFilter
                });

            this.props.stateSaving.perSession ?
                sessionStorage.setItem(this.getStateSavingTableKey(), data) :
                localStorage.setItem(this.getStateSavingTableKey(), data);
        }
    }

    private getTableStateDTO(pagination: any, filters: any, sorter: any, globalFilter: string | null): TableRequestDTO {
        this.echo += 1;
        return {
            pageLength: pagination.pageSize || pagination.defaultPageSize,
            page: (pagination.current || pagination.defaultCurrent) - 1,
            sortField: sorter.field || null,
            sortOrder: sorter.order || null,
            echo: this.echo,
            filters: filters,
            globalFilter
        };
    }

    private textFilter(stateObject: TableColumnState, columnTitle: any): any {
        if (!stateObject) {
            return <React.Fragment />;
        }

        return (
            <div className="text-filter-dropdown">
                <Input
                    ref={(ele: any) => this.searchInputs[stateObject.columnProp] = ele}
                    placeholder={`Search ${columnTitle}`} // TODO: columnTitle could be react element
                    value={stateObject.searchText || ''}
                    onChange={(e: any) => this.onInputChange(e, stateObject)}
                    onPressEnter={() => this.onSearch(stateObject)}
                    allowClear={true}
                />
                <Button type="primary" onClick={(e: any) => this.onSearch(stateObject)}>Search</Button>
            </div>
        );
    }

    private dateFilter(stateObject: TableColumnState, columnTitle: any): any {
        let div: any;
        let searchButton: any;
        return (
            <div ref={(ele: any) => div = ele} className="date-filter-dropdown">
                <DatePicker
                    ref={(ele: any) => this.searchInputs[stateObject.columnProp] = ele}
                    placeholder={`Search ${columnTitle}`} // TODO: columnTitle could be react element
                    // value={stateObject.searchText}
                    onChange={(date, dateString) => this.onDateInputChange(date, dateString, stateObject, searchButton)}
                    getPopupContainer={() => div}
                    format="M/D/YYYY"
                    allowClear={true}
                />
                <Button
                    ref={(ele: any) => searchButton = ReactDOM.findDOMNode(ele)}
                    type="primary"
                    onClick={() => this.onSearch(stateObject)}
                >
                    Search
                </Button>
            </div>
        );
    }

    private dateRangeFilter(stateObject: TableColumnState, columnTitle: any): any {
        let div: any;
        let searchButton: any;
        return (
            <div ref={(ele: any) => div = ele} className="daterange-filter-dropdown">
                <RangePicker
                    ref={(ele: any) => this.searchInputs[stateObject.columnProp] = ele}
                    onChange={(date, dateString) => this.onDateRangeInputChange(date, dateString, stateObject, searchButton)}
                    onOpenChange={status => this.onDateRangePickerOpenChange(status, stateObject)}
                    getPopupContainer={() => div}
                    format="M/D/YYYY"
                    allowClear={true}
                />
                <Button
                    ref={(ele: any) => searchButton = ReactDOM.findDOMNode(ele)}
                    type="primary"
                    onClick={() => this.onSearch(stateObject)}
                >
                    Search
                </Button>
            </div>
        );
    }

    private booleanCheckboxFilter(stateObject: TableColumnState, columnTitle: any): any {
        let searchButton: any;
        return (
            <div className="boolean-checkbox-filter-dropdown">
                <Checkbox ref={ele => this.searchInputs[stateObject.columnProp] = ele}
                    onChange={(e) => this.onInputChange(e, stateObject, searchButton, (stateCopy) => this.onSearch(stateCopy))}
                    checked={!!stateObject.searchText} />
            </div>
        );
    }

    private booleanRadioFilter(stateObject: TableColumnState, columnTitle: any): any {
        let searchButton: any;
        return (
            <div className="boolean-radio-filter-dropdown">
                <RadioGroup
                    ref={ele => this.searchInputs[stateObject.columnProp] = ele}
                    onChange={(e) => this.onInputChange(e, stateObject, searchButton)}
                    value={stateObject.searchText ? stateObject.searchText : ''}>
                    <Radio value="true">Yes</Radio>
                    <Radio value="false">No</Radio>
                    <Radio value="">All</Radio>
                </RadioGroup>
                <Button
                    ref={(ele: any) => searchButton = ReactDOM.findDOMNode(ele)}
                    type="primary"
                    onClick={() => this.onSearch(stateObject)}
                >
                    Search
                </Button>
            </div>
        );
    }

    private dropdownFilter(stateObject: TableColumnState, column: any): any {
        // DataTableColumnProps
        let options: any[] = column.dropdownFilterOptions || []; // text, value

        return (
            <div style={{ padding: 5, minWidth: 90 }}>
                {column.filterType === Filterer.DropdownMulti ? (
                    <CheckboxGroup
                        ref={(ele: any) => this.searchInputs[stateObject.columnProp] = ele}
                        onChange={(opts) => this.onInputChange({ target: { value: opts.join(','), type: 'text' } }, stateObject)}
                        value={(stateObject.searchText || '').split(',')}
                        style={{ textAlign: 'left' }}
                    >
                        {options.map((o: any, i: number) => (
                            <React.Fragment key={`${column.columnProps.title}_dpdn_${i}`}>
                                <Checkbox value={o.value}>{o.text}</Checkbox>
                                {i < options.length - 1 ? <br /> : null}
                            </React.Fragment>
                        ))}
                    </CheckboxGroup>
                ) : (
                        <RadioGroup
                            ref={(ele: any) => this.searchInputs[stateObject.columnProp] = ele}
                            onChange={(e) => this.onInputChange(e, stateObject)}
                            value={(stateObject.searchText || undefined)}
                            style={{ textAlign: 'left' }}
                        >
                            {options.map((o: any, i: number) => (
                                <React.Fragment key={`${column.columnProps.title}_dpdn_${i}`}>
                                    <Radio value={o.value}>{o.text}</Radio>
                                    {i < options.length - 1 ? <br /> : null}
                                </React.Fragment>
                            ))}
                        </RadioGroup>
                    )}

                <hr />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <a
                        onClick={() => this.onInputChange({ target: { value: '', type: 'text' } }, stateObject, null, (s) => this.onSearch(s))}
                    >
                        Reset
                    </a>
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => this.onSearch(stateObject)}
                    >
                        Ok
                    </Button>
                </div>
            </div>
        );
    }

    private filterIcon(stateObject: TableColumnState) {
        return (
            stateObject.filtered ?
                <FilterFilled style={{ color: '#108ee9' }} /> :
                <FilterOutlined style={{ color: '#aaa' }} />
        );
    }

    private onFilterVisibleChangeWithFocus(stateObject: TableColumnState): any {
        return (visible: boolean) => {
            var stateCopy = { ...stateObject };
            stateCopy.filterVisible = visible;

            this.setState(
                { columnStates: this.getUpdatedColumnStateList(stateCopy) },
                () => this.searchInputs[stateCopy.columnProp] && this.searchInputs[stateCopy.columnProp].focus());
        };
    }

    private onFilterVisibleChange(stateObject: TableColumnState): any {
        return (visible: boolean) => {
            var stateCopy = { ...stateObject };
            stateCopy.filterVisible = visible;

            this.setState({
                columnStates: this.getUpdatedColumnStateList(stateCopy)
            });
        };
    }

    private onDateRangePickerOpenChange(open: boolean, stateObject: TableColumnState): any {
        // return (status: boolean) => {
        // let picker = this.searchInputs[stateObject.columnProp];
        // let currentText = (picker.value[0] as moment.Moment).format(picker.format) +
        //     ' - ' + (picker.value[1] as moment.Moment).format(picker.format);

        // console.log(`date range picker ${status ? 'opened' : 'closed'}`);

        // if (currentText !== stateObject.searchText) {
        //     console.log('date range filter changed');
        // }

        // var stateCopy = { ...stateObject };
        // stateCopy.filterVisible = visible;

        // this.setState(
        //     { columnStates: this.getUpdatedColumnStateList(stateCopy) },
        //     () => this.searchInputs[stateCopy.columnProp] && this.searchInputs[stateCopy.columnProp].focus());
        // };
    }

    private onInputChange = (e: any, stateObject: TableColumnState, searchButton?: any, callback?: (columnState: TableColumnState) => any) => {
        var stateCopy = { ...stateObject };
        stateCopy.searchText = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        this.setState(
            { columnStates: this.getUpdatedColumnStateList(stateCopy) },
            () => {
                if (searchButton) {
                    searchButton.focus();
                }
                if (callback) {
                    callback(stateCopy);
                }
            });
    }

    private onDateInputChange = (date: moment.Moment | null, dateString: string, stateObject: TableColumnState, searchButton: any) => {
        var stateCopy = { ...stateObject };
        stateCopy.searchText = dateString;

        this.setState(
            { columnStates: this.getUpdatedColumnStateList(stateCopy) },
            () => {
                searchButton.focus();
            });
    }

    private onDateRangeInputChange = (
        dates: any, // RangeValue<moment.Moment>,
        dateStrings: [string, string],
        stateObject: TableColumnState,
        searchButton: any
    ) => {
        var stateCopy = { ...stateObject };
        stateCopy.searchText = dateStrings[0] && dateStrings[1] ? `${dateStrings[0]} - ${dateStrings[1]}` : null;

        this.setState(
            { columnStates: this.getUpdatedColumnStateList(stateCopy) },
            () => {
                searchButton.focus();
            });
    }

    private onSearch = (stateObject?: TableColumnState) => {
        let updatedColumnsStates: TableColumnState[] = [], filters: TableRequestFilterDTO[] = this.state.filters.map(f => f);

        if (stateObject) {
            let stateCopy = { ...stateObject };
            const { searchText } = stateCopy;
            // const reg = new RegExp(searchText ? searchText : '', 'gi');
            stateCopy.filterVisible = false;
            stateCopy.filtered = !!searchText;

            let filterObj = filters.filter(value => value.columnProp === stateCopy.columnProp);
            if (filterObj.length > 0) {
                filterObj[0].filter = searchText;
            } else {
                filters.push({ columnProp: stateCopy.columnProp, filter: searchText });
            }

            updatedColumnsStates = this.getUpdatedColumnStateList(stateCopy);
        } else {
            updatedColumnsStates = this.state.columnStates;
        }

        if (this.props.serverSide) {
            this.setState(
                {
                    filters,
                    pagination: { ...this.state.pagination, current: 1 },
                    columnStates: updatedColumnsStates
                },
                () => this.callFetchData(this.state.pagination, filters, this.state.sorter, this.state.globalFilter));
        } else {
            let data = this.props.data.map((item: T): any => {
                let match = true;
                filters.forEach(f => {
                    const reg = new RegExp(f.filter ? f.filter : '', 'gi');
                    let columnState = updatedColumnsStates.filter(ucs => ucs.columnProp === f.columnProp)[0];
                    let propVal = columnState.renderDataTransform ?
                        // @ts-ignore
                        columnState.renderDataTransform(item[columnState.columnProp], item) :
                        // @ts-ignore
                        item[columnState.columnProp];
                    var propType = columnState.columnType || typeof (propVal);
                    switch (propType) {
                        case ColumnType.Text:
                            match = match && (propVal ? propVal.match(reg) : false);
                            break;
                        case ColumnType.Date:
                            if (f.filter && moment(propVal).isValid() && moment(f.filter).isValid()) {
                                match = match && moment(f.filter).isSame(moment(propVal));
                            }
                            break;
                        case 'string':
                            match = match && propVal.match(reg);
                            break;
                        case ColumnType.Number:
                        case 'number':
                            // Use starts with for numbers?
                            match = match && propVal.toString().match(reg);
                            break;
                        case ColumnType.Boolean:
                        case 'boolean':
                            match = match && (!f.filter || propVal.toString() === f.filter);
                            break;
                        case 'object':
                            if (moment.isMoment(propVal) && f.filter) {
                                let dateSplit = f.filter.split(' - ');
                                if (dateSplit.length === 2) {
                                    match = match && propVal.isBetween(moment(dateSplit[0]), moment(dateSplit[1]), 'days', '[]');
                                }
                            }
                            break;
                        default:
                            break;
                    }
                });

                let globalMatch = true;
                if (this.state.globalFilter) {
                    this.state.globalFilter.split(',').forEach(f => {
                        f = f.trim();
                        const reg = new RegExp(f ? f : '', 'gi');
                        let rowMatch = false;
                        for (let prop in item) {
                            if ((item as any).hasOwnProperty(prop)) {
                                let propVal = item[prop];
                                switch (typeof (propVal)) {
                                    case 'string':
                                        rowMatch = rowMatch || !!propVal.match(reg);
                                        break;
                                    case 'number':
                                        // Use starts with for numbers?
                                        rowMatch = rowMatch || !!(propVal as number).toString().match(reg);
                                        break;
                                    case 'boolean':
                                        rowMatch = rowMatch || (!f || (propVal as boolean).toString() === f);
                                        break;
                                    case 'object':
                                        if (moment.isMoment(propVal) && f) {
                                            // Ignore
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                        globalMatch = globalMatch && rowMatch;
                    });
                }

                if (!match || !globalMatch) {
                    return null;
                }
                return {
                    ...item,
                    // name: (
                    //     <span>
                    //         {part.name.split(reg).map((text, i) => (
                    //             i > 0 ? [<span className="highlight">{match[0]}</span>, text] : text
                    //         ))}
                    //     </span>
                    // ),
                };
            }).filter((item: any) => !!item);

            this.setState({
                filters,
                columnStates: updatedColumnsStates,
                filteredData: data,
                sumResult: this.getLocalSumResult(data)
            });
        }

        this.saveTableState(
            {
                columnKey: this.state.sorter.columnKey,
                field: this.state.sorter.field,
                order: this.state.sorter.order
            },
            filters,
            updatedColumnsStates,
            this.state.globalFilter
        );
    }

    private getColumnState(customColumnProps: DataTableColumnProps<T>): TableColumnState {
        return this.state.columnStates.find(
            cs => cs.columnProp === (customColumnProps.columnProps.dataIndex || customColumnProps.columnProps.key)
        ) || TableColumnState.create({
            columnProp: customColumnProps.columnProps.dataIndex || customColumnProps.columnProps.key,
            columnType: customColumnProps.columnType,
            initialSearchValue: customColumnProps.initialFilterValue || '',
            searchText:
                customColumnProps.initialFilterValue !== null &&
                    customColumnProps.initialFilterValue !== undefined ?
                    customColumnProps.initialFilterValue as string :
                    '',
            filtered: customColumnProps.initialFilterValue !== null && customColumnProps.initialFilterValue !== undefined,
            renderDataTransform: customColumnProps.renderDataTransform
        });
    }

    private getUpdatedColumnStateList(modifiedColumnState: TableColumnState): TableColumnState[] {
        return this.state.columnStates.map(
            cs => cs.columnProp === modifiedColumnState.columnProp ? modifiedColumnState : cs);
    }

    private isEditing = (record: T) => {
        return record === this.state.editingRecord;
    }

    private edit = (record: T, form?: FormInstance, index?: number, saveOnClickOutside?: boolean) => {
        if (this.props.editOptions && !this.props.editOptions.fullTableEdit && index === this.state.editingIndex) {
            return;
        }

        let editRow = () => {
            if (form) {
                this.editingRowForm = form;
            }

            this.setState({ editingRecord: record, editingIndex: index });
        };

        if (saveOnClickOutside) {
            this.saveOnClickOutside(form || this.editingRowForm, record || {} as T, index || -1);
        }

        if (form) {
            this.save(form, record || {} as T, index || -1, (saved) => {
                if (!saved) {
                    return;
                }

                editRow();
            });
        } else {
            editRow();
        }
    }

    private save = (form: FormInstance, record: T, index: number, callback?: (saved: boolean) => void) => {
        form.validateFields().then(row => {
            let isChanged = false;

            for (var property in row) {
                if (moment.isMoment(row[property])) {
                    if (property.toLowerCase().indexOf('time') > -1 && property.toLowerCase().indexOf('date') === -1) {
                        row[property] = (row[property] as moment.Moment).format('HH:mm:ss');
                    } else {
                        row[property] = (row[property] as moment.Moment).format();
                    }
                }
            }

            for (property in row) {
                // @ts-ignore
                if (row[property] !== record[property]) {
                    isChanged = true;
                }
            }

            let finishSave = (success: boolean) => {
                let newData = this.state.data.map((value, dataIndex) => index === dataIndex ? { ...(value as any), ...row } : value);
                this.setState(
                    {
                        data: newData,
                        editingRecord: null,
                        editingIndex: null
                    },
                    () => {
                        this.refresh();
                        if (callback) {
                            callback(success);
                        }
                    }
                );
            };

            if (isChanged) {
                if (this.props.editOptions && this.props.editOptions.saveRow) {
                    this.props.editOptions.saveRow(record, row as T, (success) => {
                        if (!success) {
                            return;
                        }

                        finishSave(success);
                    });
                } else {
                    finishSave(true);
                }
            }
        }).catch(error => {
            return;
        });
    }

    private cancel = () => {
        this.setState(
            { editingRecord: null, editingIndex: null },
            () => this.props.editOptions ? this.props.editOptions.cancelEdit ? this.props.editOptions.cancelEdit() : null : null);
    }

    private getLocalSumResult = (data: T[]) => {
        if (!this.props.showSum) {
            return null;
        }

        let columns = this.props.columns;

        if (data.length <= 1) {
            return null;
        }

        // TODO: dataIndex is probably an array...
        let result: any = {};
        columns.forEach(c => {
            result[(c.columnProps.dataIndex as string) || ''] = undefined;
        });

        data.forEach(d => {
            columns.forEach(c => {
                let dataIndexSplit = ((c.columnProps.dataIndex as string) || '').split('.');
                let temp = d;
                // @ts-ignore
                dataIndexSplit.forEach(dis => temp = temp[dis]);
                let val = temp;
                result[(c.columnProps.dataIndex as string) || ''] =
                    (result[(c.columnProps.dataIndex as string) || ''] || 0)
                    + (val || 0);
            });
        });

        return result || null;
    }
}

export default DataTable;
