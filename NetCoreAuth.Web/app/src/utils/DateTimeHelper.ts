import moment from 'moment';

export const formatDateTime = (dateTime: string | moment.Moment) => {
    const format = 'dddd, MMM D YYYY h:mm a';

    if (moment.isMoment(dateTime)) {
        return dateTime.format(format);
    }

    return moment(dateTime).format(format);
};