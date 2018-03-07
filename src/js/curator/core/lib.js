/* globals $local */

// $local is passed into the factory wrapper - it's either jQuery or Zepto

let z = $local;

console.log(z);

if (!z) {
    window.alert('Curator requires jQuery or Zepto. \n\nPlease include jQuery in your HTML before the Curator widget script tag.\n\nVisit http://jquery.com/download/ to get the latest version');
}

export default z;