<%! import whenIO %>
% for user in users:
<% when_login = user.when_login %>
    <tr id=user${user.id} class='user 
    % if user.is_member:
        member
    % endif
    % if user.is_leader:
        leader
    % endif
    '>
        <td>${user.nickname}</td>
        <td>
            <span rel=${user.role}>
                % if user.is_leader:
                    Moderator\
                % elif user.is_member:
                    Contributor\
                % endif
            </span>
        </td>
        <td>
        % if when_login:
            <% localWhenIO = whenIO.WhenIO(user.timezone_offset) %>
            <span rel="${when_login.strftime('%Y%m%d%H%M%S')}">${localWhenIO.format(when_login)} ${localWhenIO.format_offset()}</span>
        % else:
            <span rel=''></span>
        % endif
        </td>
    </tr>
% endfor
