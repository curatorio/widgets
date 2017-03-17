
// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

(function(){
    let _tmplCache = {};

    let helpers = {
        networkIcon:function () {
            return this.data.network_name.toLowerCase();
        },
        networkName:function () {
            return this.data.network_name.toLowerCase();
        },
        userUrl:function () {
            if (this.data.user_url && this.data.user_url != '') {
                return this.data.user_url;
            }
            if (this.data.originator_user_url && this.data.originator_user_url != '') {
                return this.data.originator_user_url;
            }
            if (this.data.userUrl && this.data.userUrl != '') {
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
                    s = Curator.StringUtils.linksToHref(s);
                    s = Curator.StringUtils.twitterLinks(s);
                } else if (this.data.network_name === 'Instagram') {
                    s = Curator.StringUtils.linksToHref(s);
                    s = Curator.StringUtils.instagramLinks(s);
                } else if (this.data.network_name === 'Facebook') {
                    s = Curator.StringUtils.linksToHref(s);
                    s = Curator.StringUtils.facebookLinks(s);
                } else {
                    s = Curator.StringUtils.linksToHref(s);
                }

                return helpers.nl2br(s);
            }
        },
        nl2br:function(s) {
            s = s.trim();
            s = s.replace(/(?:\r\n|\r|\n)/g, '<br />');

            return s;
        },
        contentImageClasses : function () {
            return this.data.image ? 'crt-post-has-image' : 'crt-post-content-image-hidden';
        },
        contentTextClasses : function () {
            return this.data.text ? 'crt-post-has-text' : 'crt-post-content-text-hidden';

        },
        fuzzyDate : function (dateString)
        {
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
                fuzzy = 'a minute ago.'
            } else if (delta < hour) {
                fuzzy = Math.floor(delta / minute) + ' minutes ago';
            } else if (Math.floor(delta / hour) == 1) {
                fuzzy = '1 hour ago.'
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
        prettyDate : function(time) {
            let date = Curator.DateUtils.dateFromString(time);

            let diff = (((new Date()).getTime() - date.getTime()) / 1000);
            let day_diff = Math.floor(diff / 86400);
            let year = date.getFullYear(),
                month = date.getMonth()+1,
                day = date.getDate();

            if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
                return (
                    year.toString()+'-'
                    +((month<10) ? '0'+month.toString() : month.toString())+'-'
                    +((day<10) ? '0'+day.toString() : day.toString())
                );

            let r =
                (
                    (
                        day_diff == 0 &&
                        (
                            (diff < 60 && "just now")
                            || (diff < 120 && "1 minute ago")
                            || (diff < 3600 && Math.floor(diff / 60) + " minutes ago")
                            || (diff < 7200 && "1 hour ago")
                            || (diff < 86400 && Math.floor(diff / 3600) + " hours ago")
                        )
                    )
                    || (day_diff == 1 && "Yesterday")
                    || (day_diff < 7 && day_diff + " days ago")
                    || (day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago")
                );
            return r;
        }
    };

    root.parseTemplate = function(str, data) {
        /// <summary>
        /// Client side template parser that uses &lt;#= #&gt; and &lt;# code #&gt; expressions.
        /// and # # code blocks for template expansion.
        /// NOTE: chokes on single quotes in the document in some situations
        ///       use &amp;rsquo; for literals in text and avoid any single quote
        ///       attribute delimiters.
        /// </summary>
        /// <param name="str" type="string">The text of the template to expand</param>
        /// <param name="data" type="var">
        /// Any data that is to be merged. Pass an object and
        /// that object's properties are visible as variables.
        /// </param>
        /// <returns type="string" />
        let err = "";
        try {
            let func = _tmplCache[str];
            if (!func) {
                let strComp =
                    str.replace(/[\r\t\n]/g, " ")
                        .replace(/'(?=[^%]*%>)/g, "\t")
                        .split("'").join("\\'")
                        .split("\t").join("'")
                        .replace(/<%=(.+?)%>/g, "',$1,'")
                        .split("<%").join("');")
                        .split("%>").join("p.push('");
                let strFunc =
                    "let p=[],print=function(){p.push.apply(p,arguments);};" +
                        "with(obj){p.push('" + strComp + "');}return p.join('');";
                func = new Function("obj", strFunc);  // jshint ignore:line
                _tmplCache[str] = func;
            }
            helpers.data = data;
            return func.call(helpers, data);
        } catch (e) {
            window.console.log ('Template parse error: ' +e.message);
            err = e.message;
        }
        return " # ERROR: " + err + " # ";
    };
})();