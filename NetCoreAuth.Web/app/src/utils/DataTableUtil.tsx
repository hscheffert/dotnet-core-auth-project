
import * as React from 'react';
import { Checkbox, Space } from 'antd';
import DataTable, { DataTableColumnProps, Filterer, ColumnType, Renderer } from 'pages/shared/DataTable';
import { EditOutlined } from '@ant-design/icons';

class DataTableUtil {
    public static Columns = {
        DisplayOrder: (isDefaultSort: boolean) => DataTable.StandardColumns.Number('Display Order', 'displayOrder', 0, {
            columnProps: {
                align: 'left',
                width: '160px',
                sorter: {
                    compare: (a: any, b: any) => a.displayOrder - b.displayOrder,
                    multiple: 1,
                },
                defaultSortOrder: isDefaultSort ? 'ascend' : undefined
            }
        }),
        Active: (onChange: (record: any) => void) => {
            const baseProps = DataTable.StandardColumns.Boolean('Active', 'isActive', Filterer.BooleanRadio, Renderer.BooleanYesNo);

            if (!onChange) {
                return baseProps;
            }

            return {
                ...baseProps,
                renderer: null,
                filterType: Filterer.BooleanRadio,
                columnType: ColumnType.Boolean,
                columnProps: {
                    ...baseProps.columnProps,
                    width: '120px',
                    render: (value: any, record: any) => {
                        return (
                            <Checkbox aria-label="Is Active" checked={record.isActive} onChange={() => onChange(record)} />
                        );
                    }
                }
            } as DataTableColumnProps<any>;
        },
        Actions: (idKey: string, onEditClick: (record: any) => void) => {
            return {
                columnProps: {
                    title: 'Actions',
                    key: 'actions',
                    sorter: false,
                    render: (value: any, record: any) => {
                        return (
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <EditOutlined onClick={() => onEditClick(record[idKey])} />
                            </Space>
                        );
                    }
                }
            } as DataTableColumnProps<any>;
        }
    }
}

export default DataTableUtil;