% for smsAddress in sorted(user.sms_addresses, key=lambda x: [-x.is_active, x.email]):
    <tr id=row${smsAddress.id} class='smsAddress
    % if smsAddress.is_active:
        active
    % endif
'>
        <td class=email>${smsAddress.email}</td>
        <td class=trash>&mdash;</td>
    </tr>
% endfor
