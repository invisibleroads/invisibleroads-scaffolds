<%!  
import whenIO
%>
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
            <span class=text rel=${user.role}>
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
            localWhenIO = whenIO.WhenIO(user.minutes_offset)
            %>
            <span class=text rel="${when_login.strftime('%Y%m%d%H%M%S')}">
                ${localWhenIO.format(when_login)} ${localWhenIO.format_offset()}
            </span>
        % else:
            <span class=text rel=''></span>
        % endif
        </td>
    </tr>
% endfor
