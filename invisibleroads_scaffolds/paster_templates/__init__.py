from pyramid.paster import PyramidTemplate
from paste.util.template import paste_script_template_renderer


class CoreTemplate(PyramidTemplate):

    _template_dir = 'core'
    summary = 'pyramid SQLAlchemy project with user account management'
    template_renderer = staticmethod(paste_script_template_renderer)
