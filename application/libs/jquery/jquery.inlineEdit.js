/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
/*global $ jQuery window document */
/*
 * jQuery inlineEdit
 *
 * Copyright (c) 2009 Ca-Phun Ung <caphun at yelotofu dot com>
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://yelotofu.com/labs/jquery/snippets/inlineEdit/
 *
 * Inline (in-place) editing.
 *
 * @version 0.2.1
 */

(function ($) {

    $.fn.inlineEdit = function (options) {

        options = $.extend({
            value: '',
            save: '',
            buttonText: 'Save',
            placeholder: 'Click to edit'
        }, options);

        return $.each(this, function () {
            $.inlineEdit(this, options);
        });
    };

    $.inlineEdit = function (obj, options) {
        var self = $(obj),
            placeholderHtml = '<span class="inlineEdit-placeholder">' + options.placeholder + '</span>';

        self.value = function (newValue) {
            if (arguments.length) {
                self.data('value', $(newValue).hasClass('inlineEdit-placeholder') ? '' : newValue);
            }
            return self.data('value');
        };

        self.value($.trim(self.text()) || options.value);
        
        self.bind('click', function (event) {
            var $target, value;
            
            $target = $(event.target);

            if ($target.is('button')) {
                value = $target.siblings('input').val();

                if (($.isFunction(options.save) && options.save.call(self, value)) !== false || !options.save) {
                    self.value(value);
                }

            } else if ($target.is(self[0].tagName) || $target.hasClass('inlineEdit-placeholder')) {
                self
                    .html('<input type="text" value="' + self.value() + '"> <button>' + options.buttonText + '</button>')
                    .find('input')
                        .bind('blur', function () {
                            if (self.timer) {
                                window.clearTimeout(self.timer);
                            }
                            self.timer = window.setTimeout(function () {
                                self.html(self.value() || placeholderHtml);
                            }, 200);
                        })
                        .bind('keypress', function (e) {
                            console.log(e.which);
                            if (e.which === 13) {
                                self.html($(this).val() || placeholderHtml);
                                
                                if ($.isFunction(options.save)) {
                                    options.save.call(self, $(this).val());
                                }
                            }
                        })
                        .focus();
            }
        });
        
        if (!self.value()) {
            self.html($(placeholderHtml));
        } else if (options.value) {
            self.html(options.value);
        }
    };

})(jQuery);