
import DateUtils from "../utils/date";
import StringUtils from "../utils/string";

let helpers = {
    networkIcon:function () {
        return this.data.network_name.toLowerCase();
    },

    networkName:function () {
        return this.data.network_name.toLowerCase();
    },

    userUrl:function () {
        if (this.data.user_url && this.data.user_url !== '') {
            return this.data.user_url;
        }
        if (this.data.originator_user_url && this.data.originator_user_url !== '') {
            return this.data.originator_user_url;
        }
        if (this.data.userUrl && this.data.userUrl !== '') {
            return this.data.userUrl;
        }

        let netId = this.data.network_id+'';
        if (netId === '1') {
            return 'http://twitter.com/' + this.data.user_screen_name;
        } else if (netId === '2') {
            return 'http://instagram.com/'+this.data.user_screen_name;
        } else if (netId === '3') {
            return 'http://facebook.com/'+this.data.user_screen_name;
        }

        return '#';
    },

    parseText:function(s) {
        if (this.data.is_html) {
            return s;
        } else {
            if (this.data.network_name === 'Twitter') {
                s = StringUtils.linksToHref(s);
                s = StringUtils.twitterLinks(s);
            } else if (this.data.network_name === 'Instagram') {
                s = StringUtils.linksToHref(s);
                s = StringUtils.instagramLinks(s);
            } else if (this.data.network_name === 'Facebook') {
                s = StringUtils.linksToHref(s);
                s = StringUtils.facebookLinks(s);
            } else {
                s = StringUtils.linksToHref(s);
            }

            return StringUtils.nl2br(s);
        }
    },

    nl2br:function(s) {
        return StringUtils.nl2br(s);
    },

    contentImageClasses : function () {
        return this.data.image ? 'crt-post-has-image' : 'crt-post-content-image-hidden crt-post-no-image';
    },

    contentTextClasses : function () {
        return this.data.text ? 'crt-post-has-text' : 'crt-post-content-text-hidden crt-post-no-text';
    },

    fuzzyDate : function (dateString)
    {
        return DateUtils.fuzzyDate(dateString);
    },

    prettyDate : function(time) {
        DateUtils.prettyDate (time);
    }
};

export default helpers;