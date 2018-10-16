
// Change to use $local is passed into the factory wrapper - it's either jQuery or Zepto
var z = null;

// console.log(typeof $local);

if (typeof $local !== 'undefined')  {
    z = $local;
} else if (window.$crtZepto) {
    z = window.$crtZepto;
} else if (window.Zepto) {
    z = window.Zepto;
} else if (window.jQuery) {
    z = window.jQuery;
}

if (!z) {
    window.alert('Curator requires jQuery or Zepto. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}

export default z;