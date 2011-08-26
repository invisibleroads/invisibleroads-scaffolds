<%inherit file='/base.mako'/>

<%def name='title()'>Login</%def>

<%def name='css()'>
td {padding-right:0.5em}
#resetPack {display:none}
#resetForm {display:none}
#timezone_offset {display:none}
</%def>

<%def name='toolbar()'>
<a class='hover link off' href="${request.route_path('user_register')}">Register for an account</a>
</%def>

<%def name='root()'>
<script src="http://www.google.com/recaptcha/api/js/recaptcha_ajax.js"></script>
</%def>

<%def name='js()'>
var rejection_count = 0, $username = $('#username'), $password = $('#password'), $timezone_offset = $('#timezone_offset');
function login() {
    var errorCount = 0, focused = false;
    function isEmpty($input) {
        var inputID = $input.prop('id'), $output = $('#m_' + inputID);
        if ($input.val() == '') {
            $output.text('You must provide a ' + inputID);
            if (!focused) { 
                focused = true;
                $input.focus();
            }
            return 1;
        } else {
            $output.text('');
            return 0;
        }
    }
    errorCount = errorCount + isEmpty($username);
    errorCount = errorCount + isEmpty($password);
    if (errorCount) {
        $('#resetPack').hide();
        return;
    }
    var loginData = {
        'username': $username.val(),
        'password': $password.val(),
        'timezone_offset': $timezone_offset.val()
    }
    var $rc = $('#recaptcha_challenge_field'), $rr = $('#recaptcha_response_field');
    if ($rc.length) {
        loginData['recaptcha_challenge'] = $rc.val();
        loginData['recaptcha_response'] = $rr.val();
    }
    $.post("${request.route_path('user_login')}", loginData, function(data) {
        if (data.isOk) {
            window.location = "${url}";
        } else {
            $('#resetPack').show();
            $('#reset_').show();
            $('#resetForm').hide();
            rejection_count = data.rejection_count ? data.rejection_count : rejection_count + 1;
            if (rejection_count >= ${REJECTION_LIMIT}) {
                Recaptcha.create("${request.registry.settings.get('recaptcha.public', '')}", 'recaptcha', {
                    theme: 'red',
                    callback: Recaptcha.focus_response_field
                });
            }
        }
    });
}
function reset() {
    var email = $.trim($('#resetEmail').val());
    if (!email) {
        $('#resetEmail').focus();
        return;
    }
    $('#resetForm input').prop('disabled', true);
    $.post("${request.route_path('user_reset')}", {
        'email': email
    }, function(data) {
        if (data.isOk) {
            $('#m_password').html('<span class=error>Please check your mailbox</span>');
        } else {
            $('#m_password').html('<span class=error>Email not found</span>');
            $('#resetForm input').prop('disabled', false);
        }
    });
}
$('#reset_').click(function() {
    $(this).hide();
    $('#resetForm').show();
    $('#resetEmail').val('your.email@example.com').keydown(function(e) {if (13 == e.which) reset()}).select().focus();
});
$('#reset').click(reset);
$('#login').click(login);
$('#' + $timezone_offset.prop('id') + '_').click(function() {
    $(this).hide();
    $timezone_offset.show().focus();
});
$timezone_offset.val(new Date().getTimezoneOffset());
$username.keydown(function(e) {if (13 == e.which) $password.focus()});
$password.keydown(function(e) {if (13 == e.which) login()});
if ($username.val() == '') $username.focus();
</%def>

<form>
<div>
    Username<br>
    <input id=username>
    <span id=m_username>
    % if request.route_path('user_login') != request.path:
        Elevated privileges required
    % endif
        ${', '.join(request.session.pop_flash())}
    </span>
    <span id=resetPack>
        <a id=reset_ class='hover link off'>Did you forget your login?</a>
        <span id=resetForm>
            <input id=resetEmail>
            <input id=reset type=button value=Reset>
        </span>
    </span>
</div>
<div>
    Password<br>
    <input id=password type=password>
    <span id=m_password></span>
</div>
<div id=recaptcha></div>
<input id=login type=button value=Login><br>
</form>
<br>
<a href='/docs' class='hover link off'>Read documentation for ${SITE_NAME} ${SITE_VERSION}</a><br>
<a id=timezone_offset_ class='hover link off'>Change timezone</a>
<select id=timezone_offset>
    <%include file='offsets.mako'/>
</select>
