import twttr from '../libraries/twitter-text-regex';


let StringUtils = {

    camelize (s) {
        return s.replace (/(?:^|[-_])(\w)/g, function (_, c) {
            return c ? c.toUpperCase () : '';
        });
    },

    twitterLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            let username = u.replace("@","");
            return StringUtils.url("https://twitter.com/"+username,u);
        });
        s = s.replace(twttr.txt.regexen.validHashtag, function(t) {
            let tag = t.replace("#","%23");
            return StringUtils.url("https://twitter.com/search?q="+tag,t);
        });

        return s;
    },

    instagramLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_\.]+/g, function(u) {
            let username = u.replace("@","");
            return StringUtils.url("https://www.instagram.com/"+username+'/',u);
        });
        s = s.replace(twttr.txt.regexen.validHashtag, function(t) {
            let tag = t.replace("#","");
            return StringUtils.url("https://www.instagram.com/explore/tags/"+tag+'/',t);
        });

        return s;
    },

    facebookLinks (s)
    {
        s = s.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            let username = u.replace("@","");
            return StringUtils.url("https://www.facebook.com/"+username+'/',u);
        });
        s = s.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            let tag = t.replace("#","%23");
            return StringUtils.url("https://www.facebook.com/search/top/?q="+tag,t);
        });

        return s;
    },

    removeScripts (s, replace)
    {
        replace = replace || '';
        s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, function() {
            return replace;
        });

        return s;
    },

    linksToHref (s)
    {
        s = s.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+[A-Za-z0-9-_:%&~\?\/=]+/g, function(url) {
            return StringUtils.url(url);
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

        if (match && match[7].length === 11) {
            return match[7];
        } else {
            // above doesn't work if video id starts with v
            // eg https://www.youtube.com/embed/vDbr_EamBK4?autoplay=1

            let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/))([^#\&\?]*).*/;
            let match2 = url.match(regExp);
            if (match2 && match2[6].length === 11) {
                return match2[6];
            }
        }

        return false;
    },

    vimeoVideoId (url) {
        let regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/;
        let match = url.match(regExp);
        
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
    },

    nl2br:function(s) {
        s = s.trim();
        s = s.replace(/(?:\r\n|\r|\n)/g, '<br />');

        return s;
    },

    replaceAll(str, find, replace) {
        // return str.replace(new RegExp(find, 'g'), replace);
        // return str.replace(new RegExp(find, 'g'), replace);
        return str.split(find).join(replace);
    }
};

export default StringUtils;