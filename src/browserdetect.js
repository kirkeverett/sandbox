
// The browser detect singleton keeps track of what type of device
//  and screen size we're on. We use this to select a proper font
// size and display the correct messages to the user (i.e. use "tap" instead of "click")
var BrowserDetect = (function() {

    'use strict';

    var instance;

    function createInstance() {

    var small = false;
    var medium = false;
    var large = false;
    var mobile = false;
    var tablet = false;
    var touchDevice = false;
    var fontScale;
    var mediumStartWidthPx = 600;
    var largeStartWidthPx =  960;


    function init() {
        window.addEventListener('resize', update, false);
        window.addEventListener('orientationchange', update, false);

        update();
    }



    function update() {

        touchDevice = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
        small = matchesMediaQuery('all and (max-width: ' + (mediumStartWidthPx-1) + 'px)');
        medium = matchesMediaQuery('all and (max-width: ' + (largeStartWidthPx-1) + 'px) and (min-width: ' + mediumStartWidthPx + 'px)');
        mobile = touchDevice && small;
        tablet = touchDevice && medium;


        if(mobile) {
            fontScale = .6;
        } else if(!touchDevice) {
            if(medium) {
                fontScale = .7;
            } else if(small) {
                fontScale = .5;
            } else {
                fontScale = 1;
            }
        }
    }

    function isSmall() {
        return small;
    }

    function isMedium() {
        return medium;
    }

    function isLarge() {
        return large;
    }

    function isMobile() {
        return mobile;
    }

    function isTablet() {
        return tablet;
    }

    function getFontScale() {
        return fontScale;
    }

    function supportsLocalStorage() {
      return ('localStorage' in window && window['localStorage'] !== null);
    }


    function matchesMediaQuery(query) {
        var mq = window.matchMedia(query);
        return  mq.matches;
    }




    // initialize it
    init();

    return {
        update:update,
        isSmall:isSmall,
        isMedium:isMedium,
        isLarge:isLarge,
        isMobile:isMobile,
        isTablet:isTablet,
        getFontScale:getFontScale,
        supportsLocalStorage:supportsLocalStorage
    };

    }

    return {
        getInstance: function () {
            if(!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = BrowserDetect;