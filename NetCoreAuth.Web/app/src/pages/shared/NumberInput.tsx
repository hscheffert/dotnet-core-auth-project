import * as React from 'react';
import { InputNumber } from 'antd';

interface NumberInputProps {
    value?: number;
    onChange?: (value: number) => void;
    onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    // onBlur?: (value: number) => void;
    prefixCls?: string;
    min?: number;
    max?: number;
    step?: number | string;
    defaultValue?: number;
    tabIndex?: number;
    onKeyDown?: React.FormEventHandler<any>;
    disabled?: boolean;
    readOnly?: boolean;
    size?: 'large' | 'small' | 'default';
    formatter?: (value: number | string | undefined) => string;
    parser?: (displayValue: string | undefined) => number;
    placeholder?: string;
    style?: React.CSSProperties;
    className?: string;
    name?: string;
    id?: string;
    precision?: 0|1|2|3|4|5;
    minFractionDigits?: 0|1|2|3|4|5;
}
const parseRegex: RegExp = /\$\s?|(,*)|(\w+)/g;
const removeAddlDotRegex: RegExp = /(\..*)\./g;
const removeTrailingZeroRegex: RegExp = /\.0+$|(\.0?[1-9]+)0+$/;
const formatRegex: RegExp = /(?!^-)[^0-9,\.]/g;
const empty: string = '';
const replace: string = '$1';

class NumberInput extends React.Component<NumberInputProps, {}> {
    private inputRef: any;
    private justFocused: boolean;
    private formatterFunction: (num: number) => string;

    constructor(props: NumberInputProps) {
        super(props);
        this.formatter = this.formatter.bind(this);
        this.parser = this.parser.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.ref = this.ref.bind(this);

        if (typeof this.props.precision === 'number') {
            this.formatterFunction = new Intl.NumberFormat(undefined, {
                maximumFractionDigits: this.props.precision,
                minimumFractionDigits: this.props.minFractionDigits === null ? this.props.precision : this.props.minFractionDigits
            }).format;
        } else {
            this.formatterFunction = new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 5,
                minimumFractionDigits: this.props.minFractionDigits === null ? 0 : this.props.minFractionDigits
            }).format;
        }
    }

    getFormat(val: string | number | undefined) {
        if ((typeof val === 'number' && isNaN(val)) ||
            (typeof val === 'string' && val === 'NaN') ||
            val === '' ||
            val === undefined) {
            return '';
        }

        let num = parseFloat(`${val}`.replace(parseRegex, empty));

        return this.formatterFunction(num);
    }

    formatter(val: string | number | undefined) {
        if (this.inputRef === undefined || !this.inputRef.state.focused) {
            return this.getFormat(val);
        }

        let newVal = `${val}`.replace(removeAddlDotRegex, replace).
                              replace(formatRegex, empty);

        if (this.justFocused) {
            this.justFocused = false;
            return newVal.replace(removeTrailingZeroRegex, replace);
        }
        return newVal;
    }

    parser(val: string | undefined) {
        return (val || '').replace(parseRegex, '') as any;
    }

    ref(ele: any) {
        this.inputRef = (ele || {}).inputNumberRef;
    }

    onFocus(evt: any) {
        let input = evt.target;
        this.justFocused = true;
        setTimeout(() => input.setSelectionRange(0, 9999), 100);
    }

    onBlur(evt: any) {
        let input = evt.target;
        let formatted = this.getFormat(input.value);
        input.value = formatted;
        this.justFocused = false;
    }

    render() {
        let theseProps = {
            ref: this.ref,
            onFocus: this.onFocus,
            onBlur: this.onBlur,
            formatter: this.formatter,
            parser: this.parser,
        };

        let props = { ...theseProps, ...this.props };
        // props.onBlur = (evt: any) => {
        //     if (this.props.onBlur) {
        //         this.props.onBlur(evt.target.value);
        //     }
        //     this.onBlur(evt);
        // };
        props.className = 'right-align ' + this.props.className;

        return (
            <InputNumber {...props as any} />
        );
    }
}

export default NumberInput;
