var $table, $form, $formObjs, defaultByID = {}, dataColumns;
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
// Prepare form
function loadForm(postURL, rowSelector) {
    $form = $('#form');
    $formObjs = $form.find('input,select').not('#save,#cancel,#id');
    $formObjs.each(function() {defaultByID[this.id] = this.title});
    function showFormMessages(messageByID) {
        var focused = false;
        $formObjs.each(function() {
            var id = this.id;
            var message = messageByID[id];
            if (message) {
                $(this)
                    .prop('title', '<span class=error>' + message + '</span>')
                    .tooltip()
                    .show();
                if (!focused) {
                    $('#' + id).focus().select();
                    focused = true;
                }
            }
        });
    }
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
                $form.find('#id').val('').trigger('showAdd');
            } else {
                // Show form for edit
                $formObjs.each(function() {
                    var $td = $tr.find('.' + this.id);
                    var value = $td.attr('rel');
                    if (typeof value == 'undefined') {
                        value = $.trim($td.text());
                    }
                    this.value = value;
                });
                $form.find('#id').val(getNumber(id)).trigger('showEdit');
            }
            $form.overlay().load();
        }
    });
    $form.overlay({
        mask: {color: '#000', loadSpeed: 0},
        onLoad: function() {
            showFormMessages({});
            $formObjs.first().focus().select();
        },
        onClose: function() {
            $('#data_filter input').focus();
        },
        closeOnClick: false
    });
    $form.find('#save').click(function() {
        var params = {token: token, id: $form.find('#id').val()};
        $formObjs.each(function() {
            params[this.id] = this.value;
        }).end().prop('disabled', true);
        $.post(postURL, params, function(data) {
            $formObjs.end().prop('disabled', false);
            if (data.isOk) {
                $form.overlay().close();
                $table.find('tbody').html(data.content);
                applyDataTable();
            } else {
                showFormMessages(data.errorByID);
            }
        });
    });
    $formObjs.tooltip({
        position: 'center right',
        tipClass: 'formTip',
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
            $formObj.prop('title', defaultByID[$formObj.prop('id')]);
        }
    });
    return $form;
}
// Enable sorting by rel attribute
$.fn.dataTableExt.oSort['rel-asc']=function(a,b){var x=a.match(/rel="(.*?)"/)[1].toLowerCase();var y=b.match(/rel="(.*?)"/)[1].toLowerCase();return((x<y)?-1:((x>y)?1:0));};$.fn.dataTableExt.oSort['rel-desc']=function(a,b){var x=a.match(/rel="(.*?)"/)[1].toLowerCase();var y=b.match(/rel="(.*?)"/)[1].toLowerCase();return((x<y)?1:((x>y)?-1:0));};
