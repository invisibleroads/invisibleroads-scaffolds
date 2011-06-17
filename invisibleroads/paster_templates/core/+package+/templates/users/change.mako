<%inherit file='/base.mako'/>

<%def name='title()'>Account ${'Update' if user else 'Registration'}</%def>

<%def name='css()'>
td {padding-right:0.5em}
.smsAddress {color:gray}
.smsAddress.is_active {color:black}
</%def>

<%def name='js()'>
% if user:
var token = '${request.session.get_csrf_token()}';
% endif
// Save default descriptions
function getFieldID(x) {return x.id.match(/m_(.*)/)[1]}
function showFormMessages(messageByID) {
	var focused = false;
	$('.message').each(function() {
		var id = getFieldID(this);
        var message = messageByID[id];
        if (message) {
            $(this).html('<span class=error>' + message + '</span>');
            if (!focused) {
                $('#' + id).focus().select();
                focused = true;
            }
        } else {
            $(this).html(defaultByID[id]);
        }
	});
}
var defaultByID = {};
$('.message').each(function() {
	var id = getFieldID(this);
    defaultByID[id] = $(this).html();
});
// Define button behavior
function save() {
    $('#form input,select').prop('disabled', true);
	$.post("${request.route_path('user_update' if user else 'user_register')}", {
	% if user:
		token: token,
	% endif
        username: $('#username').val(),
        password: $('#password').val(),
        nickname: $('#nickname').val(),
        email: $('#email').val()
    }, function(data) {
        var messageByID = {};
        if (data.isOk) {
			messageByID['status'] = "Please check your email to ${'finalize changes to' if user else 'create'} your account.";
        } else {
            $('#form input,select').prop('disabled', false);
            messageByID = data.errorByID;
        }
        showFormMessages(messageByID);
    });
}
$('#save').click(save);
% if user:
// Mutate token
$('#mutate').click(function() {
	$.post("${request.route_path('user_mutate')}", {
		token: token
	}, function(data) {
		if (data.isOk) {
			$('#m_status').html('Token mutated successfully');
			$('#userCode').html(data.code);
		} else {
			$('#m_status').html(data.message);
		}
	});
});
// Remove SMS address after user clicks on the button
$('#smsAddresses .remove').live('click', function() {
    var $xRow = $(this).parent('div').hide();
	$.post("${request.route_path('user_update')}", {
		token: token,
		smsAddressID: getID($xRow[0]),
		smsAddressAction: 'remove'
	}, function(data) {
		if (!data.isOk) {
			alert(data.message);
            $xRow.show();
		}
	});
});
// Activate SMS address after user clicks on text
$('#smsAddresses .email').live({
	mouseenter: function() {
        var $x = $(this);
        var $xRow = $(this).parent('div');
		var is_active = $xRow.hasClass('is_active');
        $x.append('<span class=flag>&nbsp; ' + (is_active ? 'Deactivate' : 'Activate') + '</span>');
	},
	mouseleave: function() {
        var $x = $(this);
		$x.find('.flag').remove();
	},
	click: function() {
        var $x = $(this);
        var $xRow = $(this).parent('div');
		var was_active = $xRow.hasClass('is_active');
		$x.find('.flag').remove();
		$.post("${request.route_path('user_update')}", {
			token: token,
			smsAddressID: getID($xRow[0]),
			smsAddressAction: was_active ? 'deactivate' : 'activate'
		}, function(data) {
			if (data.isOk) {
				if (was_active) {
                    $xRow.removeClass('is_active');
				} else {
                    $xRow.addClass('is_active');
				}
			} else {
				alert(data.message);
			}
		});
	}
});
% endif
// Let ENTER key traverse and submit form
$('#username').keydown(function(e) {if (13 == e.which) $('#password').focus()});
$('#password').keydown(function(e) {if (13 == e.which) $('#nickname').focus()});
$('#nickname').keydown(function(e) {if (13 == e.which) $('#email').focus()});
$('#email').keydown(function(e) {if (13 == e.which) save()});
// Focus
$('#username').focus();
</%def>

<%def name='toolbar()'>
${'Update your account' if user else 'Register for an account'}
</%def>

<table id=form>
	<tr>
		<td><label for=username>Username</label></td>
		<td><input id=username autocomplete=off\
		% if user:
			value='${user.username}'
		% endif
		></td>
		<td id=m_username class=message>What you use to login</td>
	</tr>
	<tr>
		<td><label for=password>Password</label></td>
		<td><input id=password type=password autocomplete=off></td>
		<td id=m_password class=message>So you have some privacy</td>
	</tr>
	<tr>
		<td><label for=nickname>Nickname</label></td>
		<td><input id=nickname autocomplete=off\
		% if user:
			value='${user.nickname}'
		% endif
		></td>
		<td id=m_nickname class=message>How others see you</td>
	</tr>
	<tr>
		<td><label for=email>Email</label></td>
		<td><input id=email autocomplete=off\
		% if user:
			value='${user.email}'
		% endif
		></td>
		<td id=m_email class=message>To confirm changes to your account</td>
	</tr>
	<tr>
		<td></td>
		<td>
			<input id=save type=button value="${'Update' if user else 'Register'}" title='Send confirmation'>
		% if user:
			<input id=mutate type=button value=Mutate title='Invalidate other sessions for your security'>
		% endif
		</td>
		<td id=m_status class=message></td>
	</tr>
</table>
% if user:
<p>For SMS alerts, send a text message to ${request.registry.settings['sms.email']} with ${user.id}-<span id=userCode>${user.code}</span> as the subject.</p>
<div id=smsAddresses>
% for smsAddress in sorted(user.sms_addresses, key=lambda x: [-x.is_active, x.email]):
    <div id=smsAddress${smsAddress.id} class="smsAddress ${'is_active' if smsAddress.is_active else ''}">
        <input type=button class=remove value=X>
        <span class=email>${smsAddress.email}</span>
    </div>
% endfor
</div>
% endif
