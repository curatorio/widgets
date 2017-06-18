
Curator.Utils = {
    postUrl : function (post)
    {
        if (post.url && post.url !== "" && post.url !== "''")
        {
            // instagram
            return post.url;
        }

        console.log(post.url);
        if (post.network_id+"" === "1")
        {
            // twitter
            return 'https://twitter.com/'+post.user_screen_name+'/status/'+post.source_identifier;
        }

        return '';
    },

    center (elementWidth, elementHeight, bound) {
        let s = window.screen,
            b = bound || {},
            bH = b.height || s.height,
            bW = b.width || s.height,
            w = elementWidth,
            h = elementHeight;

        return {
            top: (bH) ? (bH - h) / 2 : 0,
            left: (bW) ? (bW - w) / 2 : 0
        };
    },

    popup (mypage, myname, w, h, scroll) {

        let position = this.center(w, h),
            settings = 'height=' + h + ',width=' + w + ',top=' + position.top +
                ',left=' + position.left + ',scrollbars=' + scroll +
                ',resizable';

        window.open(mypage, myname, settings);
    },

    tinyparser (string, obj) {
        return string.replace(/\{\{(.*?)\}\}/g, function (a, b) {
            return obj && typeof obj[b] !== "undefined" ? encodeURIComponent(obj[b]) : "";
        });
    },

    debounce (func, wait, immediate) {
        let timeout;
        return function() {
            let context = this, args = arguments;
            let later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },

    uId () {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    }
};

Curator.DateUtils = {
    /**
     * Parse a date string in form DD/MM/YYYY HH:MM::SS - returns as UTC
     */
    dateFromString(time) {
        dtstr = time.replace(/\D/g," ");
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
    }
};

Curator.StringUtils = {

    camelize: function (s) {
        return s.replace (/(?:^|[-_])(\w)/g, function (_, c) {
            return c ? c.toUpperCase () : '';
        });
    },

    twitterLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            let username = u.replace("@","");
            return Curator.StringUtils.url("https://twitter.com/"+username,u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            let tag = t.replace("#","%23");
            return Curator.StringUtils.url("https://twitter.com/search?q="+tag,t);
        });

        return s;
    },

    instagramLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            let username = u.replace("@","");
            return Curator.StringUtils.url("https://www.instagram.com/"+username+'/',u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            let tag = t.replace("#","");
            return Curator.StringUtils.url("https://www.instagram.com/explore/tags/"+tag+'/',t);
        });

        return s;
    },

    facebookLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            let username = u.replace("@","");
            return Curator.StringUtils.url("https://www.facebook.com/"+username+'/',u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            let tag = t.replace("#","%23");
            return Curator.StringUtils.url("https://www.facebook.com/search/top/?q="+tag,t);
        });

        return s;
    },

    linksToHref (s)
    {
        s = s.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
            return Curator.StringUtils.url(url);
        });

        return s;
    },

    url (s,t) {
        t = t || s;
        return '<a href="'+s+'" target="_blank">'+t+'</a>';
    },

    youtubeVideoId (url){
        let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        let match = url.match(regExp);

        if (match && match[7].length==11) {
            return match[7];
        } else {
            // above doesn't work if video id starts with v
            // eg https://www.youtube.com/embed/vDbr_EamBK4?autoplay=1

            let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/))([^#\&\?]*).*/;
            let match2 = url.match(regExp);
            if (match2 && match2[6].length==11) {
                return match2[6];
            }
        }

        return false;
    },

    vimeoVideoId (url) {
        let regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/;
        let match = url.match(regExp);

        console.log (match);

        if (match && match.length>=2) {
            return match[1];
        }

        return false;
    },

    filterHtml (html) {
        try {
            let div = document.createElement("div");
            div.innerHTML = html;
            let text = div.textContent || div.innerText || "";
            return text;
        } catch (e) {
            return html;
        }
    }
};