% for smsAddress in sorted(user.sms_addresses, key=lambda x: [-len(x.code), x.email]):
	<%
	smsAddressID = smsAddress.id
	%>
    <tr id=smsAddress${smsAddressID}
	% if smsAddress.code:
		class=smsAddressInactive
	% endif
	>
        <td>
            <input type=button id=smsAddressRemove${smsAddressID} class=smsAddressRemove value=- title='Remove'>
		</td>
		<td id=smsAddressEmail${smsAddressID} class=smsAddressEmail colspan=2>
			<span class=text>${smsAddress.email}</span>
		</td>
    </tr>
% endfor
