/**
 * Based on the awesome jQuery Grid-A-Licious(tm)
 *
 * Terms of Use - jQuery Grid-A-Licious(tm)
 * under the MIT (http://www.opensource.org/licenses/mit-license.php) License.
 *
 * Original Version Copyright 2008-2012 Andreas Pihlström (Suprb). All rights reserved.
 * (http://suprb.com/apps/gridalicious/)
 *
 */

import Logger from '../../core/logger';
import CommonUtils from '../../utils/common';
import HtmlUtils from '../../utils/html';
import makeArray from '../../libraries/make-array';
import z from '../../core/lib';
import ResizeObserver from 'resize-observer-polyfill/dist/ResizeObserver.es';

let LayoutWaterfallSettings = {
    selector: '.item',
    width: 225,
    gutter: 20,
    animate: false,
    animationOptions: {
        speed: 200,
        duration: 300,
        effect: 'fadeInOnAppear',
        queue: true,
        complete: function () {
        }
    }
};

class LayoutWaterfall {
    constructor(options, element) {
        Logger.log("WaterfallLayout->constructor");
        this.element = z(element);
        this.id = CommonUtils.uId ();

        // let container = this;
        this.name = this._setName(5);
        this.gridArr = [];
        this.gridArrAppend = [];
        this.gridArrPrepend = [];
        this.setArr = false;
        this.setGrid = false;
        this.cols = -1;
        this.itemCount = 0;
        this.isPrepending = false;
        this.appendCount = 0;
        this.resetCount = true;
        this.ifCallback = true;
        this.box = this.element;
        this.boxWidth = this.box.width();
        this.options = z.extend(true, {}, LayoutWaterfallSettings, options);
        this.gridArr = makeArray(this.box.find(this.options.selector));
        this.isResizing = false;
        this.w = 0;
        this.boxArr = [];
        this.visible = false;

        // this.element.is(':visible')

        // build columns
        // this._setCols(1);
        this.resize();
        // build grid
        // this._renderGrid('append');
        // add class 'gridalicious' to container
        // z(this.box).addClass('gridalicious');

        this.createHandlers ();

        this.$spacer = this.element.find('.crt-feed-spacer');

        this.$spacer.remove();
    }

    createHandlers () {
        Logger.log("WaterfallLayout->createHandlers");

        this.resizeDebounced = CommonUtils.debounce( () => {
            this.resize();
        }, 100);

        if (this.options.handleResize) {
            this.ro = new ResizeObserver((entries, observer) => {
                if (entries.length > 0) {
                    // let entry = entries[0];

                    this.redraw();
                }
            });

            this.ro.observe(this.element[0]);
        }
        this.redraw();
    }

    destroyHandlers () {
        Logger.log("WaterfallLayout->destroyHandlers");

        if (this.ro) {
            this.ro.disconnect();
        }

    }

    redraw () {
        this.resizeDebounced ();
    }

    _setName(length, current) {
        current = current ? current : '';
        return length ? this._setName(--length, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 60)) + current) : current;
    }

    _setCols(newCols) {
        Logger.log("WaterfallLayout->_setCols "+newCols);
        // calculate columns
        let boxWidth = this.box.width();
        Logger.log('boxWidth: '+boxWidth);
        this.cols = newCols;
        //If Cols lower than 1, the grid disappears
        if (this.cols < 1) {
            this.cols = 1;
        }
        let diff = (boxWidth - (this.cols * this.options.width) - this.options.gutter) / this.cols;
        let colWidth = (this.options.width + diff) / boxWidth * 100;

        Logger.log('colWidth: '+colWidth);

        if (colWidth < 0 || colWidth > 100) {
            colWidth = 100;
        }
        this.w = colWidth;
        this.colHeights = new Array(this.cols);
        this.colHeights.fill(0);
        this.colItems = new Array(this.cols);
        this.colItems.fill([]);

        // delete columns in box
        this.box.find('.galcolumn').remove();
        // build columns

        // add columns to box
        for (let i = 0; i < this.cols; i++) {
            let div = z('<div></div>').addClass('galcolumn').attr('id', 'item' + i + this.name).css({
                'width': colWidth + '%',
                'paddingLeft': this.options.gutter,
                'paddingBottom': this.options.gutter,
                'float': 'left',
                '-webkit-box-sizing': 'border-box',
                '-moz-box-sizing': 'border-box',
                '-o-box-sizing': 'border-box',
                'box-sizing': 'border-box'
            });
            this.box.append(div);
        }
    }

    _renderGrid(method, arr, count) {
        let items = [];
        let boxes = [];
        // let prependArray = prepArray || [];
        let itemCount = 0;
        let appendCount = this.appendCount;
        // let gutter = this.options.gutter;
        let cols = this.cols;
        let name = this.name;
        // let i = 0;
        // let w = z('.galcolumn').width();

        // if arr
        if (arr) {
            boxes = arr;
            // if append
            if (method === "append") {
                // get total of items to append
                appendCount += count;
                // set itemCount to last count of appened items
                itemCount = this.appendCount;
            }
            // if prepend
            if (method === "prepend") {
                // set itemCount
                this.isPrepending = true;
                itemCount = Math.round(count % cols);
                if (itemCount <= 0) itemCount = cols;
            }
            // called by _updateAfterPrepend()
            if (method === "renderAfterPrepend") {
                // get total of items that was previously prepended
                appendCount += count;
                // set itemCount by counting previous prepended items
                itemCount = count;
            }
        }
        else {
            boxes = this.gridArr;
            appendCount = z(this.gridArr).length;
        }

        // push out the items to the columns
        for (let item of boxes) {
            let width = '100%';

            // if you want something not to be "responsive", add the class "not-responsive" to the selector container
            if (item.hasClass('not-responsive')) {
                width = 'auto';
            }

            item.css({
                'zoom': '1',
                'filter': 'alpha(opacity=0)',
                'opacity': '0'
            });

            // find shortest col
            let shortestCol = 0;
            for (let i = 1; i < this.colHeights.length; i++) {
                if (this.colHeights[i] < this.colHeights[shortestCol]) {
                    shortestCol = i;
                }
            }

            // prepend or append to shortest column
            if (method === 'prepend') {
                z("#item" + shortestCol + name).prepend(item);
                items.push(item);

            } else {
                z("#item" + shortestCol + name).append(item);
                items.push(item);
                if (appendCount >= cols) {
                    appendCount = (appendCount - cols);
                }
            }

            // update col heights
            this.colItems[shortestCol].push(item);
            this.colHeights[shortestCol] += item.height();
        }

        this.appendCount = appendCount;

        if (method === "append" || method === "prepend") {
            if (method === "prepend") {
                // render old items and reverse the new items
                this._updateAfterPrepend(this.gridArr, boxes);
            }
            this._renderItem(items);
            this.isPrepending = false;
        } else {
            this._renderItem(this.gridArr);
        }
    }

    _collectItems() {
        let collection = [];
        z(this.box).find(this.options.selector).each(function () {
            collection.push(z(this));
        });
        return collection;
    }

    _renderItem(items) {

        let speed = this.options.animationOptions.speed;
        let effect = this.options.animationOptions.effect;
        let duration = this.options.animationOptions.duration;
        let queue = this.options.animationOptions.queue;
        let animate = this.options.animate;
        let complete = this.options.animationOptions.complete;

        let i = 0;
        let t = 0;

        // animate
        if (animate === true && !this.isResizing) {

            // fadeInOnAppear
            if (queue === true && effect === "fadeInOnAppear") {
                if (this.isPrepending) items.reverse();
                z.each(items, function (index, value) {
                    window.setTimeout(function () {
                        z(value).animate({
                            opacity: '1.0'
                        }, duration);
                        t++;
                        if (t === items.length) {
                            complete.call(undefined, items);
                        }
                    }, i * speed);
                    i++;
                });
            } else if (queue === false && effect === "fadeInOnAppear") {
                if (this.isPrepending) items.reverse();
                z.each(items, function (index, value) {
                    z(value).animate({
                        opacity: '1.0'
                    }, duration);
                    t++;
                    if (t === items.length) {
                        if (this.ifCallback) {
                            complete.call(undefined, items);
                        }
                    }
                });
            }

            // no effect but queued
            if (queue === true && !effect) {
                z.each(items, function (index, value) {
                    z(value).css({
                        'opacity': '1',
                        'filter': 'alpha(opacity=100)'
                    });
                    t++;
                    if (t === items.length) {
                        if (this.ifCallback) {
                            complete.call(undefined, items);
                        }
                    }
                });
            }

            // don not animate & no queue
        } else {
            z.each(items, function (index, value) {
                z(value).css({
                    'opacity': '1',
                    'filter': 'alpha(opacity=100)'
                });
            });
            if (this.ifCallback) {
                complete.call(items);
            }
        }
    }

    _updateAfterPrepend(prevItems, newItems) {
        let gridArr = this.gridArr;
        // add new items to gridArr
        z.each(newItems, function (index, value) {
            gridArr.unshift(value);
        });
        this.gridArr = gridArr;
    }

    resize() {
        Logger.log("WaterfallLayout->resize");

        let newCols = Math.floor(this.box.width() / this.options.width);

        if (newCols < 1) {
            newCols = 1;
        }

        Logger.log('newCols:'+newCols);
        Logger.log('oldCol:'+this.cols);

        if (this.cols === newCols) {
            // nothings changed yet
            // console.log('NOTHING CHANGED');
            return;
        }

        if (!HtmlUtils.isVisible(this.element)) {
            // console.log('NOT VISIBLE');
            this.visible = false;
            return;
        }

        // if (newCols > 1) {
        //     return;
        // }

        this.visible = true;
        this.ifCallback = false;
        this.isResizing = true;

        this._setCols(newCols);
        // build grid
        this._renderGrid('append');
        this.ifCallback = true;
        this.isResizing = false;
        this.boxWidth = this.box.width();
    }

    append(items) {
        let gridArr = this.gridArr;
        let gridArrAppend = this.gridArrPrepend;
        z.each(items, function (index, value) {
            gridArr.push(value);
            gridArrAppend.push(value);
        });
        this._renderGrid('append', items, z(items).length);
    }

    prepend(items) {
        this.ifCallback = false;
        this._renderGrid('prepend', items, z(items).length);
        this.ifCallback = true;
    }

    destroy () {
        this.destroyHandlers ();
    }
}

export default LayoutWaterfall;