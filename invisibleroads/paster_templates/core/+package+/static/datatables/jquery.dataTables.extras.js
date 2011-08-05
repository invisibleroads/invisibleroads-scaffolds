var $table, $form, $formObjs, defaultByName = {}, dataColumns;
// Enable sorting and filtering
function applyDataTable(aoColumns) {
    var aaSorting;
    if ($table) {
        $table.fnClearTable(false);
        aaSorting = $table.fnSettings().aaSorting;
    } else {
        aaSorting = [];
    }
    if (typeof aoColumns != 'undefined') {
        dataColumns = aoColumns;    // Save for future calls
    }
    function computeTableHeight() {
        return $(window).height() - (($('tr:first').height() + 7) * 3);
    }
    $table = $('#data').dataTable({
        'aaSorting': aaSorting,
        'aoColumns': dataColumns,
        'bDestroy': true,
        'bPaginate': false,
        'oLanguage': {'sSearch': 'Filter'},
        'sScrollY': computeTableHeight()
    });
    $(window).unbind('resize.table').bind('resize.table', function() {
        $('.dataTables_scrollBody').height(computeTableHeight());
        $table.fnAdjustColumnSizing();
    });
    $('#data_filter input').focus();
};
// Shortcut to enable click-based data modification
function applyFlag(
    cellSelector,                   // Apply flag to this jQuery selector
    requiredClass, requiredMessage, // Display requiredMessage if row lacks requiredClass
    optionalClass,
    onMessage, onValue,             // Display onMessage if row lacks optionalClass
    offMessage, offValue,           // Display offMessage if row has optionalClass
    postURL, postAttribute,         // Post update to this URL for this attribute
    nameClass                       // Use text of this column for confirmation prompt
) {
    $(cellSelector).live({
        mouseenter: function() {
            var $x = $(this), $xRow = $x.parent('tr');
            $x.find('.text').hide();
            if (!$xRow.hasClass(requiredClass)) {
                $x.append('<span class="flag inactive">' + requiredMessage + '</span>');
            } else {
                var hasOptional = $xRow.hasClass(optionalClass);
                var message = (hasOptional ? offMessage : onMessage);
                $x.append('<span class=flag>' + message + '</span>');
            }
        },
        mouseleave: function() {
            var $x = $(this);
            $x.find('.flag').remove();
            $x.find('.text').show();
        },
        click: function() {
            var $x = $(this), $xRow = $x.parent('tr');
            if (!$xRow.hasClass(requiredClass)) return;
            var hasOptional = $xRow.hasClass(optionalClass);
            var message = (hasOptional ? offMessage : onMessage);
            if (confirm(message + ' ' + $xRow.find('.' + nameClass).text() + '?')) {
                var params = {token: token, id: getID($xRow[0])};
                params[postAttribute] = hasOptional ? offValue : onValue;
                $.post(postURL, params, function(data) {
                    if (data.isOk) {
                        $table.find('tbody').html(data.content);
                        applyDataTable();
                    } else {
                        alert(data.message);
                    }
                });
            }
        }
    });
}
// Submit form fields and files via AJAX
$.fn.ajaxForm = function(options) {
    var options = $.extend({}, $.fn.ajaxForm.defaults, options);
    var iframeID = 'ajaxForm', $iframe = $('#' + iframeID), $forms = $(this);
    if (!$iframe.length) {
        $iframe = $('<iframe>', {name: iframeID, style: 'display:none'});
        $('body').append($iframe);
    }
    return $forms.each(function() {
        var $form = $(this);
        $form
            .prop('target', iframeID)
            .prop('enctype', 'multipart/form-data')
            .prop('encoding', 'multipart/form-data')
            .submit(function() {
                options.prepare.apply($form[0]);
                $iframe.one('load', function() {
                    var iframeText = $iframe.contents().find('body').text(), iframeJSON;
                    try {
                        iframeJSON = eval('(' + iframeText + ')');
                    } catch(error) {
                        $.ajaxSettings.error(undefined, 'parsererror');
                    }
                    options.success.apply($form[0], [iframeJSON]);
                });
            });
    });
};
$.fn.ajaxForm.defaults = {
    prepare: function() {},
    success: function(data) {}
};
// Prepare form
function loadForm(rowSelector) {
    $form = $('#form');
    $formObjs = $form.find('.field');
    $formObjs.each(function() {defaultByName[this.name] = this.title});
    $('body').append('<div id=info></div>');
    if (typeof rowSelector == 'undefined') {
        rowSelector = '.dataTables_scroll tr';
    }
    $(rowSelector).live({
        mouseenter: function() {
            var id = $(this).prop('id');
            if (!id) return;
            var action = (id == 'row0') ? 'add' : 'edit';
            $('#info').html('Doubleclick to ' + action);
        },
        mouseleave: function() {
            $('#info').html('');
        },
        dblclick: function() {
            var $tr = $(this), id = $tr.prop('id');
            if (!id) {
                return;
            } else if (id == 'row0') {
                // Show form for add
                $formObjs.val('');
                $form.find('[name=id]').val('').trigger('showAdd', [$tr]);
            } else {
                // Show form for edit
                $formObjs.each(function() {
                    var $td = $tr.find('.' + this.name);
                    var value = $td.attr('rel');
                    if (typeof value == 'undefined') {
                        value = $.trim($td.text());
                    }
                    this.value = value;
                });
                $form.find('[name=id]').val(getNumber(id)).trigger('showEdit', [$tr]);
            }
            $form.overlay().load();
        }
    });
    $form.overlay({
        mask: {color: '#000', loadSpeed: 0},
        onLoad: function() {
            showFormMessages($formObjs, {});
            $formObjs.first().focus().select();
        },
        onClose: function() {
            $('.formTip').hide();
            $('#data_filter input').focus();
        },
        closeOnClick: false
    });
    $form.ajaxForm({
        prepare: function() {
            if (!$form.find('[name=token]').length) {
                $form.append('<input name=token type=hidden value="' + token + '">');
            }
            $form.find('.save').prop('disabled', true);
        },
        success: function(data) {
            if (data.isOk) {
                $form.overlay().close();
                $table.find('tbody').html(data.content);
                applyDataTable();
            } else {
                showFormMessages($formObjs, data.errorByID);
            }
            $form.find('.save').prop('disabled', false);
        }
    });
    $formObjs.tooltip({
        position: 'center right',
        tipClass: 'formTip',
        events: {
            file: 'focus mouseenter,blur mouseleave'
        },
        onBeforeShow: function() {
            var $formObj = this.getTrigger(), title = $formObj.prop('title');
            if (title) {
                this.getTip().html(title);
                $formObj.prop('title', '');
            }
            // Position tooltip 10 pixels to the right of the form
            this.getConf().offset = [0, ($form.offset().left + $form.outerWidth()) - ($formObj.offset().left + $formObj.outerWidth()) + 10];
        },
        onHide: function() {
            var $formObj = this.getTrigger();
            $formObj.prop('title', defaultByName[$formObj.prop('name')]);
        }
    });
    return $form;
}
// Show form errors
function showFormMessages($fields, messageByName) {
    var focused = false;
    $fields.each(function() {
        var name = this.name, message = messageByName[name];
        if (message) {
            $(this)
                .prop('title', '<span class=error>' + message + '</span>')
                .tooltip()
                .show();
            if (!focused) {
                $('[name=' + name + ']').focus().select();
                focused = true;
            }
        }
    });
}
// Enable sorting by rel attribute
$.fn.dataTableExt.oSort['rel-asc']=function(a,b){var x=a.match(/rel="(.*?)"/)[1].toLowerCase();var y=b.match(/rel="(.*?)"/)[1].toLowerCase();return((x<y)?-1:((x>y)?1:0));};$.fn.dataTableExt.oSort['rel-desc']=function(a,b){var x=a.match(/rel="(.*?)"/)[1].toLowerCase();var y=b.match(/rel="(.*?)"/)[1].toLowerCase();return((x<y)?1:((x>y)?-1:0));};
