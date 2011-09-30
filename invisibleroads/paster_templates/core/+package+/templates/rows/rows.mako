% for row in rows:
    <tr id=row${row.id} class='row user${row.user_id}
        % if row.is_active:
            active
        % endif
    '>
		<td>${row.user.nickname}</td>
		<td>${row.col1}</td>
		<td>${row.col2}</td>
        <td>
            <% when_update = row.when_update %>
            <span rel="${when_update.strftime('%Y%m%d%H%M%S')}">
                ${USER_WHENIO.format(when_update)}
            </span>
        </td>
	</tr>
% endfor
