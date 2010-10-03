# Import pylons modules
from paste.script.templates import Template, var
from pylons.util import PylonsTemplate


class InvisibleRoadsBasicTemplate(PylonsTemplate):
    _template_dir = ('invisibleroads', 'pylons/templates/basic')
    summary = 'InvisibleRoads basic template'
    vars = []

    def pre(self, command, output_dir, vars):
        super(InvisibleRoadsBasicTemplate, self).pre(command, output_dir, vars)
        vars['template_engine'] = 'mako'
        vars['sqlalchemy'] = True
