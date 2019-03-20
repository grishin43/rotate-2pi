//REQUIRE REFACTOR. TO DO. -> P.S. in progress... Need to fix images load
(function ($) {
    var defaults = {
            path: 'images/product/',
            prefix: '',
            postfix: '',
            preloader: true,
            preloaderPath: 'images/preloader.gif',
            count: 1,
            extension: '.jpg',
            autoplay: false,
            autoplayDelay: 2000,
            autoplaySpeed: 40,
            smooth: false,
            load: true,
            partial: 1
        },
        imagesArr = [],
        imageIndex = 1,
        startX = 0,
        endX = 0,
        offsetX = 0,
        isFlipping = false,
        direction = 1,
        playInterval = null,
        spritesFlipping = null,
        spriteFlipCoefficient = null,
        isStopFlipping = false,
        isPause = true,
        isLoaded = false,
        uploadImages = function (rotateContainer, params) {
            if (!params.load && !isLoaded) {
                rotateContainer.html('');
            }
            for (var i = 0; i < (params.count / params.partial) + 1; i++) {
                if (!params.load) {
                    var index;
                    if (i === 0) {
                        index = i + 1;
                    }
                    else if (((i - 1) * params.partial) + 1 === params.count) {
                        index = params.count;
                    }
                    else {
                        index = i * params.partial;
                    }
                    var img = '<img src="' + params.path + params.prefix + index + params.postfix + params.extension + '" data-image-index="' + index + '" data-loaded="false" style="display:none;">';
                    rotateContainer.append(img);
                }
                else {
                    //TO DO
                    var image = new Image();
                    image.src = params.path + params.prefix + i + params.postfix + params.extension;
                    imagesArr.push(image);
                    image = null;
                }
            }
        },
        addPartialImages = function (rotateContainer, params) {
            if (!params.load) {
                imagesArr.each(function () {
                    var index = $(this).data('image-index');
                    var nextIndex = $(this).next().data('image-index');
                    var newIndex = index + 1;
                    if (index !== params.count && newIndex !== nextIndex) {
                        var img = '<img src="' + params.path + params.prefix + newIndex + params.postfix + params.extension + '" data-image-index="' + newIndex + '" data-loaded="false" style="display:none;">';
                        $(img).insertAfter($(this));
                    }
                });
                triggerImages(rotateContainer, params);
            }
        },
        updatePartialImages = function (rotateContainer, params) {
            if (!params.load) {
                var x = params.partial;
                while (x > 1) {
                    setTimeout(addPartialImages(rotateContainer, params), params.autoplayDelay * 2);
                    x--;
                }
            }
        },
        triggerImages = function (rotateContainer, params) {
            imagesArr = rotateContainer.find('img');
            if (!params.load) {
                imagesArr.each(function () {
                    $(this).one('load', function () {
                        $(this).attr('data-loaded', 'true');
                        imagesArr = rotateContainer.find('img[data-loaded=true]');
                        if (imagesArr.length === params.count) {
                            spriteFlipCoefficient = Math.ceil(params.count / 100);
                        }
                        if (imagesArr.length === Math.floor(params.count / params.partial) && !isLoaded) {
                            imagesArr = rotateContainer.find('img[data-loaded=true]');
                            rotateContainer.trigger('rotate-2pi-loaded');
                            setTimeout(function () {
                                if (params.autoplay) {
                                    methods.play(params.autoplaySpeed);
                                }
                            }, params.autoplayDelay);
                            isLoaded = true;
                            imagesArr.removeClass('active');
                            imagesArr.first().addClass('active');
                        }
                    });
                    if (this.complete) {
                        $(this).trigger('load');
                    }
                });
            }
            else {
                imagesArr.attr('src', imagesArr[0].src);
            }
        };

    var methods = {
        init: function (options) {
            var settings = $.extend({}, defaults, options);

            return this.each(function () {

                var $this = $(this),
                    data = $this.data('rotate2pi');

                if (!data) {

                    var productImage = $this.find('img'),
                        indexInc = 1,
                        moveOffset = 300;

                    spriteFlipCoefficient = Math.ceil(settings.count / (100 * settings.partial));


                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        moveOffset = 100;
                    }

                    $this.css({
                        'position': 'relative',
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

                    if (!settings.load) {
                        uploadImages($this, settings);
                    }

                    var moveHandler = function (event) {
                        var posX = event.clientX || event.originalEvent.changedTouches[0].pageX;
                        var offset = posX - endX;
                        if (Math.abs(offset) > 1) {
                            endX = event.clientX || event.originalEvent.changedTouches[0].pageX;

                            if (imageIndex >= imagesArr.length) {
                                imageIndex = 1;
                            }
                            else if (imageIndex < 1) {
                                imageIndex = imagesArr.length;
                            }
                            if (startX && endX) {
                                startX < endX ? direction = 1 : direction = 0;
                            }

                            if (!settings.load) {
                                imagesArr.removeClass('active');
                                imagesArr.eq(imageIndex - 1).addClass('active');
                            }
                            else {
                                productImage.attr('src', imagesArr[imageIndex - 1].src);
                            }

                            imageIndex = imageIndex + (spriteFlipCoefficient * (offset / Math.abs(offset)));
                        }
                    };

                    spritesFlipping = function () {
                        if (direction) {
                            if (imageIndex >= imagesArr.length) {
                                imageIndex = 1;
                            }
                            imageIndex += indexInc;
                            if (!settings.load) {
                                imagesArr.removeClass('active');
                                imagesArr.eq(imageIndex - indexInc).addClass('active');
                            }
                            else {
                                productImage.attr('src', imagesArr[imageIndex - indexInc].src);
                            }
                        }
                        else {
                            if (imageIndex < indexInc) {
                                imageIndex = imagesArr.length - 1;
                            }
                            imageIndex -= indexInc;
                            if (!settings.load) {
                                imagesArr.removeClass('active');
                                imagesArr.eq(imageIndex).addClass('active');
                            }
                            else {
                                productImage.attr('src', imagesArr[imageIndex].src);
                            }
                        }
                    };


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
                        methods.stop();
                        startX = event.clientX || event.originalEvent.touches[0].pageX;
                        isStopFlipping = true;
                        $(document).bind('mousemove.rotate2pi touchmove.rotate2pi', moveHandler);
                    });

                    $(document).bind('mouseup.rotate2pi touchend.rotate2pi', function (event) {
                        if (settings.autoplay) {
                            methods.play(settings.autoplaySpeed);
                        }
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
                                    easing: 'linear',
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
                        $(document).unbind('mousemove.rotate2pi touchmove.rotate2pi');
                    });

                    if (!settings.load) {
                        triggerImages($this, settings);
                        updatePartialImages($this, settings);
                    }

                }

            });
        },
        play: function (speed) {
            if (isPause) {
                playInterval = setInterval(spritesFlipping, speed);
                isPause = false;
            }
        },
        stop: function () {
            if (!isPause) {
                clearInterval(playInterval);
                isPause = true;
            }
        },
        destroy: function () {
            return this.each(function () {
                var $this = $(this);
                methods.stop();

                $this.unbind('.rotate2pi');
                $(document).unbind('.rotate2pi');
                $this.removeData('rotate2pi');

                imagesArr = null;
                imageIndex = null;
                startX = null;
                endX = null;
                offsetX = null;
                isFlipping = null;
                direction = null;
                playInterval = null;
                spritesFlipping = null;
                isStopFlipping = null;
                isPause = null;
                isLoaded = false;
                spriteFlipCoefficient = null;
            });
        },
        reinit: function (options) {
            var settings = $.extend({}, defaults, options);

            methods.stop();

            return this.each(function () {
                var $this = $(this);

                imagesArr = [];
                startX = 0;
                endX = 0;
                offsetX = 0;
                direction = 1;
                isLoaded = false;
                spriteFlipCoefficient = Math.ceil(settings.count / (100 * settings.partial));

                if (!settings.load) {
                    uploadImages($this, settings);
                    triggerImages($this, settings);
                    updatePartialImages($this, settings);
                }

                imageIndex = 1;
            });
        }
    };

    $.fn.rotate2pi = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Unfortunately, the function named: ' + method + ' does not exist for rotate-2pi ¯\\_(ツ)_/¯');
        }

    };
})(jQuery);