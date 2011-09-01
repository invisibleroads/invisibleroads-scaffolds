<%def name='format_select(selectID, selectValue, optionPacks, tip)'>
<select id=${selectID} title="${tip}">
% for value, name in optionPacks:
<option value=${value}\
% if value == selectValue:
 selected\
% endif
>${name}</option>
% endfor
</select>
</%def>
