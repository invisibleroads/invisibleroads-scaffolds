# Import pylons modules
from paste.script.templates import Template, var
from pylons.util import PylonsTemplate


class InvisibleRoadsTemplate(PylonsTemplate):
    _template_dir = ('invisibleroads', 'pylons/templates/authentication')
    summary = 'Pylons template with authentication'
    vars = []

    def pre(self, command, output_dir, vars):
        super(InvisibleRoadsTemplate, self).pre(command, output_dir, vars)
        vars['template_engine'] = 'mako'
        vars['sqlalchemy'] = True
