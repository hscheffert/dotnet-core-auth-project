import moment from 'moment';
import * as React from 'react';
import { Button, Checkbox } from 'antd';
import { ButtonShape } from 'antd/lib/button';
import { Link, RouteComponentProps } from 'react-router-dom';
import Icon from '@ant-design/icons';

class Renderers extends React.Component<{} & RouteComponentProps<any>, {}> {
    public static shortDate(value: string | moment.Moment | null, format?: string) {
        if (!value) {
            return;
        }

        let date = moment.isMoment(value) ? value : moment(value);

        if (!date.isValid()) {
            return '';
        }

        return (
            <span>{date.utc(false).format(format || 'M/D/YYYY')}</span>
        );
    }

    public static shortTime(value: string | moment.Moment) {
        if (!value) {
            return;
        }

        let date = moment.isMoment(value) ? value : moment(value);

        if (!date.isValid()) {
            date = moment(value, 'HH:mm:ss');

            if (!date.isValid()) {
                return '';
            }
        }

        return (
            <span>{date.format('h:mm a')}</span>
        );
    }

    public static longDate(value: string | moment.Moment) {
        if (!value) {
            return;
        }

        let date = moment.isMoment(value) ? value : moment(value);

        if (!date.isValid()) {
            return '';
        }

        return (
            <span>{date.utc(false).format('ddd, MMM D YYYY')}</span>
        );
    }

    public static dateAndTime(value: string | moment.Moment) {
        if (!value) {
            return;
        }

        let date = moment.isMoment(value) ? value : moment(value);

        if (!date.isValid()) {
            return '';
        }

        return (
            <span>{date.format('M/D/YYYY h:mm a')}</span>
        );
    }

    public static currency(value: string) {
        if (!value || isNaN(value as any)) {
            return;
        }

        try {
            let num = parseFloat(value);
            return (
                <span>${num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}</span>
            );
        } catch (error) {
            return;
        }
    }

    public static percentage(value: string) {
        if (!value || isNaN(value as any)) {
            return;
        }

        try {
            let num = +parseFloat(value).toFixed(2);

            return (
                <span>{num.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}%</span>
            );
        } catch (error) {
            return;
        }
    }

    public static decimal(value: string, decimalPlaces: number) {
        if (!value || isNaN(value as any)) {
            return;
        }

        try {
            let num = parseFloat(value);
            return (
                <span>{num.toFixed(decimalPlaces)}</span>
            );
        } catch (error) {
            return;
        }
    }

    public static booleanYesNo(value: boolean) {
        return value ? 'Yes' : 'No';
    }

    public static booleanYesEmpty(value: boolean) {
        return value ? 'Yes' : '';
    }

    public static booleanCheckbox(value: boolean) {
        return <Checkbox defaultChecked={value} disabled={true} />;
    }

    public static linkButtons(links: string | { link: string, icon: string }[]) {
        if (!links || links.length === 0) {
            return;
        }

        let isString = typeof links === 'string';
        let strVal = links as string;
        let arrVal = links as { link: string, icon: string }[];
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {isString ?
                    (strVal ? this.linkButton(strVal) : '') :
                    arrVal.map(link => this.linkButton(link.link, link.icon))}
            </div>
        );
    }

    public static linkButton(link: string, icon?: string, shape?: ButtonShape) {
        let iconName = icon ? icon : 'arrow-right';
        shape = shape ? shape : (iconName === 'arrow-right' ? 'circle' : undefined);
        return (
            <Link to={link} key={iconName} style={{ flex: 1 }}>
                {shape ? <Button shape={shape} size="small" icon={iconName} />
                    : <Icon type={iconName} className="link-button" />}
            </Link>
        );
    }
}

export default Renderers;