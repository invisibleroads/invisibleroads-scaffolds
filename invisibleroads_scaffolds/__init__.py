from pyramid.paster import PyramidTemplate


class CoreTemplate(PyramidTemplate):

    _template_dir = 'core'
    summary = 'Pyramid SQLAlchemy project with user account management'
