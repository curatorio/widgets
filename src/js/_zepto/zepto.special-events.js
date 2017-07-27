
/**
 * Enable special events on Zepto
 * @license Copyright 2013 Enideo. Released under dual MIT and GPL licenses.
 */
/// Place this code before defining the Special Events, but after Zepto

;(function($, undefined){

  $.event.special = $.event.special || {};
  var bindBeforeSpecialEvents = $.fn.bind;
  $.fn.bind = function(eventName, data, callback){
    var el = this,
        $this = $(el),
        specialEvent;

    if( callback == null ){
      callback = data;
      data = null;
    }

    if( $.zepto ){
      $.each( eventName.split(/\s/), function(i, eventName){
        eventName = eventName.split(/\./)[0];
        if( (eventName in $.event.special) ){
          specialEvent = $.event.special[eventName];
          /// init enable special events on Zepto
          if( !specialEvent._init ) {
            specialEvent._init = true;

            /// intercept and replace the special event handler to add functionality
            specialEvent.originalHandler = specialEvent.handler;
            specialEvent.handler = function(){

              /// make event argument writeable, like on jQuery
              var args = Array.prototype.slice.call(arguments);
              args[0] = $.extend({},args[0]);

              /// define the event handle, $.event.dispatch is only for newer versions of jQuery
              $.event.handle = function(){

                /// make context of trigger the event element
                var args = Array.prototype.slice.call(arguments),
                    event = args[0],
                    $target = $(event.target);

                $target.trigger.apply( $target, arguments );

              };

              specialEvent.originalHandler.apply(this,args);

            }
          }

          /// setup special events on Zepto
          specialEvent.setup.apply( el, [data] );
        }
      });
    }

    return bindBeforeSpecialEvents.apply(this,[eventName,callback]);

  };
})(Zepto);