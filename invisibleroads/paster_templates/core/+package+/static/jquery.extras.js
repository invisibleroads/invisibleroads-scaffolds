// Get and set tooltips
function getTipByName($fields) {
    var tipByName = {};
    $fields.each(function() {
        tipByName[this.name] = this.title;
    });
    return tipByName;
}
function setTipByName($fields, tipByName) {
    var focused = false;
    $fields.each(function() {
        var name = this.name, tip = tipByName[name];
        if (tip) {
            $(this).prop('title', '<span class=error>' + tip + '</span>').tooltip().show();
            if (!focused) {
                $('[name=' + name + ']').focus().select();
                focused = true;
            }
        }
    });
}
// Submit form fields and files
$.fn.ajaxForm = function(options) {
    options = $.extend({}, $.fn.ajaxForm.defaults, options);
    var iframeName = 'ajaxForm', $iframe = $('[name=' + iframeName + ']');
    if (!$iframe.length) {
        $iframe = $('<iframe name=' + iframeName + ' style="display:none">').appendTo('body');
    }
    return $(this).each(function() {
        var $form = $(this);
        $form
            .prop('target', iframeName)
            .prop('enctype', 'multipart/form-data')
            .prop('encoding', 'multipart/form-data')
            .submit(function(e) {
                options.onSubmit.apply($form[0]);
                if (!$form.find('[type=file]').length) {
                    e.preventDefault();
                    $.post($form.prop('action'), $form.serialize(), function(data) {
                        options.onResponse.apply($form[0], [data]);
                    });
                } else {
                    $iframe.one('load', function() {
                        var iframeText = $iframe.contents().find('body').text(), iframeJSON;
                        try {
                            iframeJSON = eval('(' + iframeText + ')');
                        } catch(error) {
                            $.ajaxSettings.error(null, 'parsererror');
                        }
                        options.onResponse.apply($form[0], [iframeJSON]);
                    });
                }
            });
    });
};
$.fn.ajaxForm.defaults = {
    onSubmit: function() {},
    onResponse: function(data) {}
};
$.fn.focusNext = function($field) {
    $(this).keydown(function(e) {
        if (13 == e.which) {
            e.preventDefault();
            $field.focus()
        }
    });
}
$.fn.prepareForm = function() {
    return $(this).each(function() {
        var $form = $(this), $fields = $form.find('[name]'), tipByName = getTipByName($fields);
        $fields.tooltip({
            position: 'center right',
            tipClass: 'formTip',
            events: {file: 'focus mouseenter,blur mouseleave'},
            onBeforeShow: function() {
                var $field = this.getTrigger(), title = $field.prop('title');
                if (title) {
                    this.getTip().html(title);
                    $field.prop('title', '');
                }
                // Position tooltip 10 pixels to the right of the form
                this.getConf().offset = [0, ($form.offset().left + $form.outerWidth()) - ($field.offset().left + $field.outerWidth()) + 10];
            },
            onHide: function() {
                var $field = this.getTrigger();
                $field.prop('title', tipByName[$field.prop('name')]);
            }
        });
        $form.ajaxForm({
            onSubmit: function() {
                if (!$form.find('[name=token]').length) {
                    try {
                        $form.append('<input name=token type=hidden value="' + token + '">');
                    } catch(e) {}
                }
                $form.find('.save').prop('disabled', true);
            },
            onResponse: function(data) {
                if (data.isOk) {
                    $form.trigger('onSuccess', [data]);
                } else {
                    setTipByName($fields, data.errorByID);
                }
                $form.find('.save').prop('disabled', false);
            }
        });
    });
}
$.fn.prepareOverlayForm = function() {
    return $(this).prepareForm().each(function() {
        var $form = $(this), $fields = $form.find('[name]');
        $form.overlay({
            mask: {color: '#000', loadSpeed: 0},
            onLoad: function() {
                setTipByName($fields, {});
                $fields.first().focus().select();
            },
            onClose: function() {
                $('.formTip').hide();
            },
            closeOnClick: false
        });
        $form.bind('onSuccess', function(e, data) {
            $form.overlay().close();
        });
    });
}
// Apply click-based table data modification
$.fn.clickToggle = function(options) {
    options = $.extend({}, $.fn.clickToggle.defaults, options);
    function mask($x) {
        var $content = $x.find('.content');
        if ($content.length) return;
        $x.html('<span class=content style="display:none">' + $x.html() + '</span>');
    }
    function unmask($x) {
        var $content = $x.find('.content');
        if ($content.length) {
            $x.html($content.html());
        }
    }
    return $(this).live({
        mouseenter: function() {
            var $td = $(this), $tr = $td.parents('tr');
            mask($td);
            if (!$tr.hasClass(options.requiredClass)) {
                $td.append('<span class="flag inactive">' + options.requiredMessage + '</span>');
            } else {
                var hasOptional = $tr.hasClass(options.optionalClass);
                var message = (hasOptional ? options.offMessage : options.onMessage);
                $td.append('<span class=flag>' + message + '</span>');
            }
            $(this).css('cursor', 'pointer');
        },
        mouseleave: function() {
            var $td = $(this);
            unmask($td);
            $(this).css('cursor', 'auto');
        },
        click: function() {
            var $td = $(this), $tr = $td.parents('tr');
            if (!$tr.hasClass(options.requiredClass)) {
                return;
            } else {
                var hasOptional = $tr.hasClass(options.optionalClass)
                var message = (hasOptional ? options.offMessage : options.onMessage);
                unmask($td);
                if (confirm(message + ' ' + $tr.find('.' + options.nameClass).text() + '?')) {
                    var params = {token: token, id: getID($tr[0])};
                    params[options.postAttribute] = hasOptional ? options.offValue : options.onValue;
                    $.post(options.postURL, params, function(data) {
                        if (data.isOk) {
                            var $table = $tr.parents('table');
                            if (typeof data.content != 'undefined') {
                                $table.find('tbody').html(data.content);
                            }
                            if (typeof $table.data('dataTableCustom') != 'undefined') {
                                $table.dataTableCustom();
                            }
                            options.onSuccess.apply($td[0], [data]);
                        } else {
                            alert(data.message);
                        }
                    });
                }
            }
        }
    });
};
$.fn.clickToggle.defaults = {
    requiredClass: '',       // Display requiredMessage if row lacks requiredClass
    requiredMessage: '',
    optionalClass: '',
    onMessage: '',           // Display onMessage if row lacks optionalClass
    onValue: 1,             
    offMessage: '',          // Display offMessage if row has optionalClass
    offValue: 0,         
    postURL: '',             // Post update to this URL for this attribute
    postAttribute: '',         
    nameClass: '',           // Use text of this column for confirmation prompt
    onSuccess: function(data) {}
};

if (typeof $.fn.dataTable != 'undefined') {

$.fn.prepareTableOverlayForm = function($table, $rows) {
    var tableID = $table.prop('id');
    // Get $info or make one if it doesn't exist
    var $info = $('#info');
    if (!$info.length) {
        $info = $('<div>', {id: 'info'}).appendTo('body');
    }
    return $(this).prepareOverlayForm().each(function() {
        var $form = $(this), $fields = $form.find('[name]');
        // Get $id or make one if it doesn't exist
        var $id = $form.find('[name=id]');
        if (!$id.length) {
            $id = $('<input name=id type=hidden>').appendTo($form);
        }
        // Define row hover behavior
        if (typeof $rows == 'undefined') {
            $rows = $('#' + tableID + '_wrapper tr');
        }
        $rows.live({
            mouseenter: function() {
                var $tr = $(this), message;
                if ($tr.find('th').length) {
                    message = 'add';
                } else {
                    var id = $tr.prop('id');
                    if (!id) return;
                    message = 'edit';
                }
                $info.html('Doubleclick to ' + message);
                $(this).css('cursor', 'pointer');
            },
            mouseleave: function() {
                $info.html('');
                $(this).css('cursor', 'auto');
            },
            dblclick: function() {
                var $tr = $(this);
                if ($tr.find('th').length) {
                    // Show form for add
                    $fields.not('[type=submit],[type=button]').val('');
                    $form.trigger('showAdd', [$tr]);
                } else {
                    var id = $tr.prop('id');
                    if (!id) return;
                    // Show form for edit
                    $fields.not('[type=submit],[type=button],[name=id]').each(function() {
                        var $td = $tr.find('.' + this.name);
                        var value = $td.attr('rel');
                        if (typeof value == 'undefined') {
                            value = $.trim($td.text());
                        }
                        this.value = value;
                    });
                    $id.val(getNumber(id));
                    $form.trigger('showEdit', [$tr]);
                }
                $form.overlay().load();
            }
        });
        $form.bind('onSuccess', function(e, data) {
            $table.find('tbody').html(data.content);
            $table.dataTableCustom();
        });
        $form.bind('onClose', function() {
            $('#' + tableID + '_filter input').focus();
        });
    });
}
// Enable sorting by rel
$.fn.dataTableExt.oSort['rel-numeric-asc'] = function(a, b) {
    var x = a.match(/rel="*(-?[0-9]+)/)[1];
    var y = b.match(/rel="*(-?[0-9]+)/)[1];
    x = parseFloat(x);
    y = parseFloat(y);
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
};
$.fn.dataTableExt.oSort['rel-numeric-desc'] = function(a, b) {
    var x = a.match(/rel="*(-?[0-9]+)/)[1];
    var y = b.match(/rel="*(-?[0-9]+)/)[1];
    x = parseFloat(x);
    y = parseFloat(y);
    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
};
$.fn.dataTableExt.oSort['rel-string-asc'] = function(a, b) {
    var x = a.match(/rel="(.*?)"/)[1].toLowerCase();
    var y = b.match(/rel="(.*?)"/)[1].toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
};
$.fn.dataTableExt.oSort['rel-string-desc'] = function(a, b) {
    var x = a.match(/rel="(.*?)"/)[1].toLowerCase();
    var y = b.match(/rel="(.*?)"/)[1].toLowerCase();
    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
};
// Apply sorting and filtering
$.fn.dataTableCustom = function(options) {
    options = $.extend({}, $.fn.dataTableCustom.defaults, options);
    return $(this).each(function() {
        var $table = $(this), pot = $table.data('dataTableCustom'), $dataTable, aaSorting, aoColumns, computeTableHeight;
        if (typeof pot == 'undefined') {
            aaSorting = [];
            aoColumns = options['aoColumns'];
            computeTableHeight = options['computeTableHeight'];
        } else {
            $dataTable = pot['$dataTable'];
            $dataTable.fnClearTable(false);
            aaSorting = $dataTable.fnSettings().aaSorting;
            aoColumns = pot['aoColumns'];
            computeTableHeight = pot['computeTableHeight'];
        }
        $dataTable = $table.dataTable({
            aaSorting: aaSorting, 
            aoColumns: aoColumns, 
            bDestroy: true, 
            bPaginate: false, 
            oLanguage: {sSearch: 'Filter'}, 
            sScrollY: computeTableHeight()
        });
        var tableID = $table.prop('id'), eventType = 'resize.' + tableID;
        $(window).unbind(eventType).bind(eventType, function() {
            $dataTable.parents('.dataTables_scrollBody').height(computeTableHeight());
            $dataTable.fnAdjustColumnSizing();
        });
        $table.data('dataTableCustom', {$dataTable: $dataTable, aoColumns: aoColumns, computeTableHeight: computeTableHeight});
        $('#' + tableID + '_filter input').focus();
    });
};
$.fn.dataTableCustom.defaults = {
    aoColumns: null,
    computeTableHeight: function() {
        return $('#main').height() - $('#header').height() * 2;
    }
};

}
