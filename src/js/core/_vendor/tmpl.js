
// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

(function(){
    var _tmplCache = {};

    var helpers = {
        networkIcon:function () {
            return this.data.network_name.toLowerCase();
        },
        userUrl:function () {
            var netId = this.data.network_id+'';
            if (netId === '1') {
                return 'http://twitter.com/' + this.data.user_screen_name;
            } else if (netId === '2') {
                return 'http://instagram.com/'+this.data.user_screen_name;
            } else if (netId === '3') {
                return 'http://facebook.com/'+this.data.user_screen_name;
            }

            return this.data.network_id;

        },
        parseText:function(s) {
            if (this.data.network_id===1 || this.data.network_id==='1') {
                // twitter
                s = Curator.StringUtils.linksToHref(s);
                s = Curator.StringUtils.twitterLinks(s);
            } else if (this.data.network_id===2 || this.data.network_id==='2') {
                // instagram
                s = Curator.StringUtils.linksToHref(s);
                s = Curator.StringUtils.instagramLinks(s);
            }

            return s;
        },
        contentImageClasses : function () {
            return this.data.image ? 'crt-post-has-image' : 'crt-post-content-image-hidden';
        },
        contentTextClasses : function () {
            return this.data.text ? 'crt-post-has-text' : 'crt-post-content-text-hidden';

        }
    };

    this.parseTemplate = function(str, data) {
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
        var err = "";
        try {
            var func = _tmplCache[str];
            if (!func) {
                var strComp =
                    str.replace(/[\r\t\n]/g, " ")
                        .replace(/'(?=[^%]*%>)/g, "\t")
                        .split("'").join("\\'")
                        .split("\t").join("'")
                        .replace(/<%=(.+?)%>/g, "',$1,'")
                        .split("<%").join("');")
                        .split("%>").join("p.push('");
                var strFunc =
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +
                        "with(obj){p.push('" + strComp + "');}return p.join('');";
                func = new Function("obj", strFunc);  // jshint ignore:line
                _tmplCache[str] = func;
            }
            helpers.data = data;
            return func.call(helpers, data);
        } catch (e) {
            root.console.log ('Template parse error: ' +e.message);
            err = e.message;
        }
        return " # ERROR: " + err + " # ";
    };
})();