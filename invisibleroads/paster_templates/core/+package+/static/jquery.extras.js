// Get and set tooltips
function getTipByName($fieldsWithTips) {
    var tipByName = {};
    $fieldsWithTips.each(function() {
        tipByName[this.name || this.className] = this.title;
    });
    return tipByName;
}
function setTipByName($fieldsWithTips, tipByName) {
    var focused = false;
    $fieldsWithTips.each(function() {
        var tip = tipByName[this.name || this.className];
        if (tip) {
            var $field = $(this), tipsAPI = $field.tooltip(), tipHTML = '<span class=error>' + tip + '</span>';
            if (tipsAPI.isShown()) {
                tipsAPI.getTip().html(tipHTML);
            } else {
                $field.prop('title', tipHTML);
            }
            // Prevent a tooltip appearing offscreen before form is visible
            if ($field.is(':visible')) {
                $field.tooltip().show();
                if (!focused) {
                    $field.focus().select();
                    focused = true;
                }
            }
        }
    });
}
// Submit form fields and files
$.fn.ajaxForm = function(options) {
    options = $.extend({}, {
        onSubmit:function() {},
        onResponse:function(data) {}
    }, options);
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
                    $.post($form.prop('action'), $form.serialize(), function(data) {
                        options.onResponse.apply($form[0], [data]);
                    });
                    return false;
                }
                $iframe.one('load', function() {
                    var iframeText = $iframe.contents().find('body').text(), iframeJSON;
                    try {
                        iframeJSON = eval('(' + iframeText + ')');
                    } catch(error) {
                        $.ajaxSettings.error(null, 'parsererror');
                    }
                    options.onResponse.apply($form[0], [iframeJSON]);
                });
            });
    });
};
$.fn.focusNext = function($field) {
    $(this).keydown(function(e) {
        if (13 == e.which) {
            $field.focus();
            return false;
        }
    });
}
$.fn.prepareForm = function() {
    function showReplace() {
        var $form = $(this), $replace = $form.find('.replace');
        if (!$replace.length) return;
        $replace.siblings('input').prop('disabled', true).hide();
        $replace.show();
    }
    function hideReplace() {
        var $form = $(this), $replace = $form.find('.replace');
        if (!$replace.length) return;
        $replace.hide();
        $replace.siblings('input').prop('disabled', false).show();
    }
    return $(this).each(function() {
        var $form = $(this), $fieldsWithTips = $form.find('[title]'), tipByName = getTipByName($fieldsWithTips);
        $fieldsWithTips.tooltip({
            position:'center right',
            tipClass:'formTip',
            events:{file:'focus mouseenter,blur mouseleave'},
            onBeforeShow:function() {
                var $field = this.getTrigger(), title = $field.prop('title');
                if (title) {
                    this.getTip().html(title);
                    $field.prop('title', '');
                }
                // Position tooltip 10 pixels to the right of the form
                this.getConf().offset = [0, 10 - ($field.offset().left + $field.outerWidth()) + ($form.offset().left + $form.outerWidth())];
            },
            onHide:function() {
                var $field = this.getTrigger();
                $field.prop('title', tipByName[$field.prop('name') || $field.prop('className')]);
            }
        });

        var $tabs = $form.find('.tabs');
        if ($tabs.length) {
            var tabsAPI = $tabs.tabs('.panes > div', {
                onClick:function(e, i) {
                    if ($form.is(':visible')) {
                        $form.find('[name]').not(':visible').each(function() {
                            $(this).tooltip().hide();
                        });
                        var $pane = this.getPanes().eq(i);
                        $pane.find('input,select,textarea').filter(':visible').first().focus();
                    }
                }
            }).data('tabs');

            $form.bind('onBeforeError', function(e, data) {
                for (name in data.errorByName) {
                    var $field = $('[name=' + name + ']'), $pane = $field.parents('.panes > div');
                    tabsAPI.click($pane.parent().children().index($pane));
                    break;
                }
            });
        }

        $form.ajaxForm({
            onSubmit:function() {
                if (typeof token != 'undefined' && !$form.find('[name=token]').length) {
                    try {
                        $form.append('<input name=token type=hidden value="' + token + '">');
                    } catch(e) {}
                }
                $form.find('.save').prop('disabled', true);
            },
            onResponse:function(data) {
                $form.find('.save').prop('disabled', false);
                if (data.isOk) {
                    $form.trigger('onSuccess', [data]);
                } else {
                    if (data.message) {
                        alert(data.message);
                    } else {
                        $form.trigger('onBeforeError', [data]);
                        setTipByName($fieldsWithTips, data.errorByName);
                    }
                }
            }
        }).bind({
            showAdd:hideReplace,
            showEdit:showReplace
        }).find('.replace').click(function() {
            hideReplace.apply($(this).parents('form'), [null]);
        });
    });
}
$.fn.prepareOverlayForm = function() {
    return $(this).prepareForm().each(function() {
        var $form = $(this);
        $form.overlay({
            mask:{color:'#000', loadSpeed:0},
            onLoad:function() {
                $form.find('[name]:visible').first().focus().select();
            },
            onClose:function() {
                $form.find('[title]').each(function() {
                    $(this).tooltip().hide();
                });
            },
            closeOnClick:false
        });
        $form.bind('onSuccess', function(e, data) {
            $form.overlay().close();
        });
    });
}
// Apply click-based table data modification
$.fn.clickToggle = function(options) {
    options = $.extend({}, {
        requiredClass:'',       // Display requiredMessage if row lacks requiredClass
        requiredMessage:'',
        optionalClass:'',
        onMessage:'',           // Display onMessage if row lacks optionalClass
        onValue:1,             
        offMessage:'',          // Display offMessage if row has optionalClass
        offValue:0,         
        postURL:'',             // Post update to this URL for this attribute
        postAttribute:'',         
        nameClass:'',           // Use text of this column for confirmation prompt
        onSuccess:function(data) {}
    }, options);
    function mask($x) {
        var $content = $x.find('.content');
        if ($content.length) return;
        $x.html('<span class=content style="display:none">' + $x.html() + '</span>');
    }
    function unmask($x) {
        var $content = $x.find('.content');
        if ($content.length) $x.html($content.html());
    }
    return $(this).live({
        mouseenter:function() {
            var $td = $(this), $tr = $td.parents('tr');
            mask($td);
            if (!$td.find('.flag').length) {
                if (!$tr.hasClass(options.requiredClass)) {
                    $td.append('<span class="flag inactive">' + options.requiredMessage + '</span>');
                } else {
                    var hasOptional = $tr.hasClass(options.optionalClass);
                    var message = (hasOptional ? options.offMessage : options.onMessage);
                    $td.append('<span class=flag>' + message + '</span>');
                }
            }
            $td.css('cursor', 'pointer');
        },
        mouseleave:function() {
            var $td = $(this);
            unmask($td);
            $td.css('cursor', 'auto');
        },
        click:function() {
            var $td = $(this), $tr = $td.parents('tr');
            if (!$tr.hasClass(options.requiredClass)) return;
            var hasOptional = $tr.hasClass(options.optionalClass);
            var message = (hasOptional ? options.offMessage : options.onMessage);
            unmask($td);
            if (confirm(message + ' ' + $tr.find('.' + options.nameClass).text() + '?')) {
                var params = {token:token, id:getID($tr[0])};
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
    });
};

if (typeof $.fn.dataTable != 'undefined') {

$.fn.prepareTableOverlayForm = function($table, $rows) {
    var tableID = $table.prop('id'), tableInfo;
    return $(this).prepareOverlayForm().each(function() {
        var $form = $(this), $fields = $form.find('[name]');
        // Get $id or make one if it doesn't exist
        var $id = $form.find('[name=id]');
        if (!$id.length) $id = $('<input name=id type=hidden>').appendTo($form);
        // Enable add
        var $tableAdd = $('#' + tableID + '_add');
        if ($tableAdd.length) {
            $tableAdd.die().live('click', function() {
                $fields.not('[type=submit],[type=button]').val('');
                $id.val('');
                $form.trigger('showAdd').overlay().load()
            });
        }
        // Enable edit
        ($rows || $table.find('tr')).live({
            mouseenter:function() {
                var $tr = $(this), id = $tr.prop('id');
                var $tableInfo = $('#' + tableID + '_info');
                if (!id) return;
                tableInfo = $tableInfo.html();
                $tableInfo.html('Doubleclick to edit');
                $(this).css('cursor', 'pointer');
            },
            mouseleave:function() {
                var $tableInfo = $('#' + tableID + '_info');
                $tableInfo.html(tableInfo);
                $(this).css('cursor', 'auto');
            },
            dblclick:function() {
                var $tr = $(this), id = $tr.prop('id');
                if (!id) return;
                // Show form for edit
                $fields.not('[type=submit],[type=button],[name=id]').each(function() {
                    var name = this.name, $td = $tr.find('.' + name), value = $td.attr('rel');
                    if (typeof value == 'undefined') value = $.trim($td.text());
                    this.value = value;
                });
                $id.val(getNumber(id));
                $form.trigger('showEdit', [$tr]).overlay().load();
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
    options = $.extend({}, {
        aoColumns:null,
        computeTableHeight:function() {
            return $('#main').height() - $('#header').height() * 2;
        },
        onLoad:function() {}
    }, options);
    return $(this).each(function() {
        var $table = $(this), pot = $table.data('dataTableCustom'), $dataTable, aaSorting, aoColumns, computeTableHeight;
        if (typeof pot == 'undefined') {
            aaSorting = [];
            aoColumns = options['aoColumns'];
            computeTableHeight = options['computeTableHeight'];
            onLoad = options['onLoad'];
        } else {
            $dataTable = pot['$dataTable'];
            $dataTable.fnClearTable(false);
            aaSorting = $dataTable.fnSettings().aaSorting;
            aoColumns = pot['aoColumns'];
            computeTableHeight = pot['computeTableHeight'];
            onLoad = pot['onLoad'];
        }
        $dataTable = $table.dataTable({
            aaSorting:aaSorting, 
            aoColumns:aoColumns, 
            bDestroy:true, 
            bPaginate:false, 
            oLanguage:{sSearch: ''}, 
            sScrollY:computeTableHeight()
        });
        var tableID = $table.prop('id'), eventType = 'resize.' + tableID;
        $(window).unbind(eventType).bind(eventType, function() {
            $dataTable.parents('.dataTables_scrollBody').height(computeTableHeight());
            $dataTable.fnAdjustColumnSizing();
        });
        $('#' + tableID + '_filter input').prop('placeholder', 'Filter results').focus();
        $table.data('dataTableCustom', {
            $dataTable:$dataTable, 
            aoColumns:aoColumns, 
            computeTableHeight:computeTableHeight,
            onLoad:onLoad
        });
        onLoad.apply($table[0]);
    });
};

}
