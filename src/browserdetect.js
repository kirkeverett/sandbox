module.exports = function(mediumStartWidthPx, largeStartWidthPx) {

    'use strict';

    var small = false;
    var medium = false;
    var large = false;
    var mobile = false;
    var tablet = false;
    var touchDevice = false;
    var fontScale;

    function update() {

        // Set some sensible defaults
        mediumStartWidthPx = mediumStartWidthPx || 600;
        largeStartWidthPx = largeStartWidthPx || 960;

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

    function matchesMediaQuery(query) {
        var mq = window.matchMedia(query);
        return  mq.matches;
    }

    // initialize it
    update();

    return {
        update:update,
        isSmall:isSmall,
        isMedium:isMedium,
        isLarge:isLarge,
        isMobile:isMobile,
        isTablet:isTablet,
        getFontScale:getFontScale
    };

};
