

let z = null;
if (window.$crt) {
    z = window.$crt;
} else if (window.Zepto) {
    z = window.Zepto;
} else if (window.jQuery) {
    z = window.jQuery;
} else {
    window.alert('Curator requires jQuery or Zepto. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}

export default z;