'Setup script for invisibleroads-templates'
import os

from setuptools import setup, find_packages


entry_points = """
[paste.paster_create_template]
ir_core = invisibleroads.paster_templates:CoreTemplate
"""


here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.rst')).read()
CHANGES = open(os.path.join(here, 'CHANGES.rst')).read()


setup(
    name='invisibleroads-templates',
    version='1.7.4',
    description='Pyramid application templates based on invisibleroads.com',
    long_description=README + '\n\n' +  CHANGES,
    license='MIT',
    classifiers=[
        'Intended Audience :: Developers',
        'Framework :: Pylons',
        'Programming Language :: Python',
        'License :: OSI Approved :: MIT License',
    ],
    keywords='web wsgi bfg pylons pyramid',
    author='Roy Hyunjin Han',
    author_email='service@invisibleroads.com',
    url='https://github.com/invisibleroads/invisibleroads-templates',
    entry_points=entry_points,
    install_requires=['pyramid'],
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False)
