<%inherit file="/base.mako"/>

<%def name="title()">Account ${'Registration' if c.isNew else 'Update'}</%def>

<%def name="css()">
.field {width: 15em}
</%def>

<%def name="js()">
function getMessageObj(id) { return $('#m_' + id); }
var ids = [username, 'password', 'nickname', 'email', 'status'];
var defaultByID = {};
for (var i=0; i<ids.length; i++) {
    var id = ids[i];
    defaultByID[id] = getMessageObj(id).html();
}
function showFeedback(messageByID) {
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var o = getMessageObj(id);
        if (messageByID[id]) {
            o.html('<b>' + messageByID[id] + '</b>');
        } else {
            o.html(defaultByID[id]);
        }
    }
}
$('#buttonSave').click(function() {
    // Get
    var username = $('#username').val(),
        password = $('#password').val(), 
        nickname = $('#nickname').val(), 
        email = $('#email').val();
    // Lock
    $('.lockOnSave').attr('disabled', 'disabled');
    // Post
    $.post("${h.url('person_register_' if c.isNew else 'person_update_')}", {
        username: username,
        password: password,
        nickname: nickname,
        email: email
    }, function(data) {
        var messageByID = {};
        if (data.isOk) {
            messageByID['status'] = "Please check your email to ${'create' if c.isNew else 'finalize changes to'} your account.";
        } else {
            $('.lockOnSave').removeAttr('disabled');
            messageByID = data.errorByID;
        }
        showFeedback(messageByID);
    }, 'json');
});
$('#username').focus();
</%def>

<%def name="toolbar()">
${'Register for an account' if c.isNew else 'Update your account'}
</%def>

<table>
    <tr>
        <td class=label><label for=username>Username</label></td>
        <td class=field><input id=username name=username class="lockOnSave maximumWidth" autocomplete=off></td>
        <td id=m_username>What you use to login</td>
    </tr>
    <tr>
        <td class=label><label for=password>Password</label></td>
        <td class=field><input id=password name=password class="lockOnSave maximumWidth" type=password autocomplete=off></td>
        <td id=m_password>So you have some privacy</td>
    </tr>
    <tr>
        <td class=label><label for=nickname>Nickname</label></td>
        <td class=field><input id=nickname name=nickname class="lockOnSave maximumWidth" autocomplete=off></td>
        <td id=m_nickname>How others see you</td>
    </tr>
    <tr>
        <td class=label><label for=email>Email</label></td>
        <td class=field><input id=email name=email class="lockOnSave maximumWidth" autocomplete=off></td>
        <td id=m_email>To confirm changes to your account</td>
    </tr>
    <tr>
        <td></td>
        <td><input id=buttonSave class=lockOnSave type=button value="${'Register' if c.isNew else 'Update'}"></td>
        <td id=m_status></td>
    </tr>
</table>
