(function ($) {
    var imagesArr = [],
        isActive = false,
        imageIndex = 1,
        startX = 0,
        endX = 0,
        offsetX = 0,
        isFlipping = false,
        direction = 1,
        isStopFlipping = false;

    var methods = {
        init: function (options) {
            var settings = $.extend({
                'path': 'images/product/',
                'prefix': '',
                'postfix': '',
                'preloader': true,
                'preloaderPath': 'images/preloader.gif',
                'count': '1',
                'extension': '.jpg',
                'autoplay': false,
                'smooth': false
            }, options);

            return this.each(function () {

                var $this = $(this),
                    data = $this.data('rotate2pi');

                if (!data) {

                    var productImage = $this.find('img'),
                        playInterval,
                        isPlaying = settings.autoplay,
                        indexInc = 1,
                        spriteFlipInterval = Math.round((360 / settings.count) * 12) + 45,
                        spriteFlipCoefficient = Math.ceil(settings.count / 50),
                        moveOffset = 300;

                    isActive = true;

                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        moveOffset = 100;
                    }

                    $this.css({
                        'position': 'relative',
                        'max-width': productImage.width() + 'px',
                        'margin-left': 'auto',
                        'margin-right': 'auto'
                    });

                    productImage.css({
                        'width': 'auto',
                        'max-width': '100%',
                        'height': 'auto',
                        'max-height': '100%',
                        'cursor': 'w-resize',
                        'user-select': 'none'
                    });

                    if (settings.preloader) {
                        $this.append('<div class="preloader-2pi" style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:1051;background:rgba(255, 255, 255, 0.8);display:flex;display:-ms-flex;align-items: center;justify-content: center;"><img src="' + settings.preloaderPath + '" alt="preloader" style="max-height: 100px;"></div>');
                    }

                    for (var i = 1; i <= settings.count; i++) {
                        var image = new Image();
                        image.src = settings.path + settings.prefix + i + settings.postfix + settings.extension;
                        imagesArr.push(image);
                        image = null;
                    }

                    productImage.attr('src', imagesArr[0].src);

                    var moveHandler = function (event) {
                        var posX = event.clientX || event.originalEvent.changedTouches[0].pageX;
                        var offset = posX - endX;
                        if (Math.abs(offset) > 1) {
                            endX = event.clientX || event.originalEvent.changedTouches[0].pageX;
                            imageIndex = imageIndex + (spriteFlipCoefficient * (offset / Math.abs(offset)));

                            if (imageIndex >= settings.count) {
                                imageIndex = 1;
                            }
                            if (imageIndex < 1) {
                                imageIndex = settings.count;
                            }
                            if (startX && endX) {
                                startX < endX ? direction = 1 : direction = 0;
                            }

                            productImage.attr('src', imagesArr[imageIndex - 1].src);
                        }
                    };

                    var spritesFlipping = function () {
                        if (isActive) {
                            if (direction) {
                                if (imageIndex >= settings.count) {
                                    imageIndex = indexInc;
                                }
                                imageIndex += indexInc;
                                productImage.attr('src', imagesArr[imageIndex - indexInc].src);
                            }
                            else {
                                if (imageIndex < indexInc) {
                                    imageIndex = settings.count;
                                }
                                imageIndex -= indexInc;
                                productImage.attr('src', imagesArr[imageIndex].src);
                            }
                        }
                    };


                    $(window).load(function () {

                        if (settings.preloader) {
                            $this.find('.preloader-2pi').fadeOut({
                                complete: function () {
                                    $(this).remove();
                                }
                            });
                        }

                        $this.bind('drag.rotate2pi dragdrop.rotate2pi dragstart.rotate2pi', function () {
                            return false;
                        });

                        $this.bind('mousedown.rotate2pi touchstart.rotate2pi', function (event) {
                            startX = event.clientX || event.originalEvent.touches[0].pageX;
                            // clearInterval(playInterval);
                            isPlaying = false;
                            isStopFlipping = true;
                            $(document).bind('mousemove.rotate2pi touchmove.rotate2pi', moveHandler);
                        });

                        $(document).bind('mouseup.rotate2pi touchend.rotate2pi', function (event) {
                            endX = event.clientX || event.originalEvent.changedTouches[0].pageX;
                            if (startX) {
                                offsetX = Math.abs(startX - endX);
                            }
                            if (settings.smooth) {
                                if (!isFlipping && startX && offsetX > moveOffset) {
                                    isFlipping = true;
                                    isStopFlipping = false;
                                    $({incValue: spriteFlipCoefficient}).animate({incValue: 1}, {
                                        duration: 3000,
                                        step: function () {
                                            if (!isStopFlipping) {
                                                indexInc = Math.round(this.incValue);
                                                spritesFlipping();
                                            }
                                        },
                                        complete: function () {
                                            indexInc = 1;
                                            isFlipping = false;
                                            startX = 0;
                                        }
                                    });
                                }
                            }
                            isPlaying = true;
                            $(document).unbind('mousemove.rotate2pi touchmove.rotate2pi');
                        });

                        if (settings.autoplay) {
                            playInterval = function () {
                                setTimeout(function () {
                                    playInterval();
                                    if(isPlaying){
                                        spritesFlipping();
                                    }
                                },28);
                            };
                            playInterval();
                        }
                    });
                }

            });
        },
        destroy: function () {
            return this.each(function () {
                var $this = $(this);

                $this.unbind('.rotate2pi');
                $(document).unbind('.rotate2pi');
                $this.removeData('rotate2pi');
                //TO DO
            });
        },
        reinit: function () {
            return this.each(function () {
                var $this = $(this),
                    productImage = $this.find('img'),
                    count = parseInt($this.data('count')),
                    path = $this.data('path'),
                    prefix = $this.data('prefix'),
                    postfix = $this.data('postfix'),
                    extension = $this.data('extension');

                isActive = false;
                imagesArr = [];
                startX = 0;
                endX = 0;
                offsetX = 0;
                direction = 1;

                for (var i = 1; i <= count; i++) {
                    var image = new Image();
                    image.src = path + prefix + i + postfix + extension;
                    imagesArr.push(image);
                    if (i === count) {
                        imageIndex = 1;
                        productImage.attr('src', imagesArr[0].src);
                        $('.default-preloader').fadeOut();
                        isActive = true;
                    }
                    image = null;
                }
                //TO DO
            });
        }
    };

    $.fn.rotate2pi = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Unfortunately, the function named: ' + method + ' does not exist for rotate-2pi ;(');
        }

    };
})(jQuery);