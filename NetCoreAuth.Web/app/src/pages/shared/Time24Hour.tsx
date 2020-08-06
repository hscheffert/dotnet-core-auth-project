import * as moment from 'moment';
import * as React from 'react';
import { Input } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

interface Time24HourProps {
    value?: moment.Moment | null;
    onChange?: (e: moment.Moment | undefined) => void;
    format?: string;
    disabled?: boolean;
    size?: SizeType;
    className?: string;
    style?: React.CSSProperties;
    minuteStep?: number;
}

interface Time24HourState {
    value: moment.Moment | undefined;
    editing: boolean;
    raw: string | undefined;
}

class Time24Hour extends React.Component<Time24HourProps, Time24HourState> {

    private isDirty: boolean = false;

    constructor(props: Time24HourProps) {
        super(props);

        this.state = {
            value: props.value || undefined,
            editing: false,
            raw: props.value ? props.value.format('HHmm') : undefined
        };
    }
    componentDidUpdate(prevProps: Time24HourProps, prevState: Time24HourState) {
        if (prevProps.value !== this.props.value) {
            this.setState({
                value: this.props.value || undefined,
                raw: this.props.value ? this.props.value.format('HHmm') : ''
            });
        }
    }

    render() {
        let { raw, value, editing } = this.state;
        let val = editing ? raw : (value ? value.format(this.props.format || 'HH:mm') : undefined);

        return (
            <Input
                onFocus={(e) => {
                    let target = e.target;
                    this.setState({ editing: true }, () => {
                        target.select();
                    });
                }}
                onBlur={() => this.setState({ editing: false }, this.sendChange)}
                type={editing ? 'number' : ''}
                size={this.props.size || 'middle'}
                value={val}
                placeholder="Time"
                onChange={this.onChange}
                disabled={this.props.disabled || false}
                className={this.props.className}
                style={this.props.style}
            />
        );
    }

    private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.isDirty = true;
        let val = e.target.value;
        let value = this.parseValue(val);
        if (value != null && this.props.minuteStep) {
            value = this.roundToNearestXXMinutes(value, this.props.minuteStep);
        }
        this.setState({ raw: val, value: value });
    }

    private roundToNearestXXMinutes = (dateTime: moment.Moment, roundTo: number) => {
        let remainder = roundTo - (dateTime.minute() + dateTime.second() / 60) % roundTo;
        remainder = (remainder > roundTo / 2) ? remainder = -roundTo + remainder : remainder;
        return dateTime.clone().add(remainder, 'minutes').seconds(0);
    }

    private parseValue = (value: string | undefined) => {
        if (!value) {
            return undefined;
        }

        // @ts-ignore
        var parsed = moment(value, 'HHmm');

        if (!parsed.isValid() && value.length === 3) {
            // @ts-ignore
            parsed = moment(`0${value}`, 'HHmm');
        }

        if (!parsed.isValid()) {
            return undefined;
        }

        return parsed;
    }

    private sendChange = () => {
        if (this.props.onChange && this.isDirty) {
            this.isDirty = false;
            this.props.onChange(this.state.value);
        }
    }
}

export default Time24Hour;
