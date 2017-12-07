import t from "../core/translate";

let DateUtils = {
    /**
     * Parse a date string in form DD/MM/YYYY HH:MM::SS - returns as UTC
     */
    dateFromString(time) {
        let dtstr = time.replace(/\D/g," ");
        let dtcomps = dtstr.split(" ");

        // modify month between 1 based ISO 8601 and zero based Date
        dtcomps[1]--;

        let date = new Date(Date.UTC(dtcomps[0],dtcomps[1],dtcomps[2],dtcomps[3],dtcomps[4],dtcomps[5]));

        return date;
    },

    /**
     * Format the date as DD/MM/YYYY
     */
    dateAsDayMonthYear(strEpoch) {
        let myDate = new Date(parseInt(strEpoch, 10));
        // console.log(myDate.toGMTString()+"<br>"+myDate.toLocaleString());

        let day = myDate.getDate() + '';
        let month = (myDate.getMonth() + 1) + '';
        let year = myDate.getFullYear() + '';

        day = day.length === 1 ? '0' + day : day;
        month = month.length === 1 ? '0' + month : month;

        let created = day + '/' + month + '/' + year;

        return created;
    },

    /**
     * Convert the date into a time array
     */
    dateAsTimeArray(strEpoch) {
        let myDate = new Date(parseInt(strEpoch, 10));

        let hours = myDate.getHours() + '';
        let mins = myDate.getMinutes() + '';
        let ampm;

        if (hours >= 12) {
            ampm = 'PM';
            if (hours > 12) {
                hours = (hours - 12) + '';
            }
        }
        else {
            ampm = 'AM';
        }

        hours = hours.length === 1 ? '0' + hours : hours; //console.log(hours.length);
        mins = mins.length === 1 ? '0' + mins : mins; //console.log(mins);

        let array = [
            parseInt(hours.charAt(0), 10),
            parseInt(hours.charAt(1), 10),
            parseInt(mins.charAt(0), 10),
            parseInt(mins.charAt(1), 10),
            ampm
        ];

        return array;
    },


    fuzzyDate (dateString) {
        let date = Date.parse(dateString+' UTC');
        let delta = Math.round((new Date () - date) / 1000);

        let minute = 60,
            hour = minute * 60,
            day = hour * 24,
            week = day * 7,
            month = day * 30;

        let fuzzy;

        if (delta < 30) {
            fuzzy = 'Just now';
        } else if (delta < minute) {
            fuzzy = delta + ' seconds ago';
        } else if (delta < 2 * minute) {
            fuzzy = 'a minute ago.';
        } else if (delta < hour) {
            fuzzy = Math.floor(delta / minute) + ' minutes ago';
        } else if (Math.floor(delta / hour) === 1) {
            fuzzy = '1 hour ago.';
        } else if (delta < day) {
            fuzzy = Math.floor(delta / hour) + ' hours ago';
        } else if (delta < day * 2) {
            fuzzy = 'Yesterday';
        } else if (delta < week) {
            fuzzy = 'This week';
        } else if (delta < week * 2) {
            fuzzy = 'Last week';
        } else if (delta < month) {
            fuzzy = 'This month';
        } else {
            fuzzy = date;
        }

        return fuzzy;
    },

    prettyDate (time) {
        let date = DateUtils.dateFromString(time);

        let diff = (((new Date()).getTime() - date.getTime()) / 1000);
        let day_diff = Math.floor(diff / 86400);
        let year = date.getFullYear(),
            month = date.getMonth()+1,
            day = date.getDate();

        if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) {
            return year.toString() + '-' + ((month < 10) ? '0' + month.toString() : month.toString()) + '-' + ((day < 10) ? '0' + day.toString() : day.toString());
        }

        let minute_diff = Math.floor(diff / 60);
        let hour_diff = Math.floor(diff / 3600);
        let week_diff = Math.ceil(day_diff / 7);

        let r =
            (
                (
                    day_diff === 0 &&
                    (
                        (diff < 60 && t.t("Just now")) ||
                        (diff < 3600 && t.t("minutes ago", minute_diff)) || //
                        (diff < 86400 && t.t("hours ago", hour_diff)) // + " hours ago")
                    )
                ) ||
                (day_diff === 1 && t.t("Yesterday")) ||
                (day_diff < 7 && t.t("days ago",day_diff)) ||
                (day_diff < 31 && t.t("weeks ago",week_diff))
            );
        return r;
    }
};

export default DateUtils;