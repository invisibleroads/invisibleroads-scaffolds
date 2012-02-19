import os
from setuptools import setup, find_packages


HERE = os.path.abspath(os.path.dirname(__file__))
load = lambda x: open(os.path.join(HERE, x)).read()


setup(
    name='invisibleroads-scaffolds',
    version='1.8.0',
    description='Pyramid application scaffolds based on invisibleroads.com',
    long_description=load('README.rst') + '\n\n' + load('CHANGES.rst'),
    license='MIT',
    classifiers=[
        'Intended Audience :: Developers',
        'Framework :: Pylons',
        'Programming Language :: Python',
        'License :: OSI Approved :: MIT License',
    ],
    keywords='web wsgi bfg pylons pyramid',
    author='Roy Hyunjin Han',
    author_email='starsareblueandfaraway@gmail.com',
    url='https://github.com/invisibleroads/invisibleroads-scaffolds',
    entry_points="""\
        [pyramid.scaffold]
        ir_core = invisibleroads_scaffolds:CoreTemplate
    """,
    install_requires=['pyramid'],
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False)
