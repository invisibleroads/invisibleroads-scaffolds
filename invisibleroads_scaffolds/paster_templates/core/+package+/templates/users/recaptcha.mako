<%inherit file='/base.mako'/>

<%def name='title()'>Checkpoint</%def>

<%def name='js()'>
$('#recaptcha_response_field').focus();
</%def>

<form action="${request.url}" method=post>
<script src='http://www.google.com/recaptcha/api/challenge?k=${request.registry.settings.get('recaptcha.public', '')}'></script>
<input type=submit value='Prove you are human'>
</form>
