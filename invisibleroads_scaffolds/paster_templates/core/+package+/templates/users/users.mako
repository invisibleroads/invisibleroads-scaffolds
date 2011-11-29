<%! import whenIO %>
% for user in users:
    <tr id=row${user.id} class='user 
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
                    Leader\
                % elif user.is_member:
                    Member\
                % endif
            </span>
        </td>
        <td>
        % if user.when_login:
            <%
            when_login = user.when_login
            localWhenIO = whenIO.WhenIO(user.timezone_offset)
            %>
            <span rel="${when_login.strftime('%Y%m%d%H%M%S')}">
                ${localWhenIO.format(when_login)} ${localWhenIO.format_offset()}
            </span>
        % else:
            <span rel=''></span>
        % endif
        </td>
    </tr>
% endfor
