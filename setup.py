try:
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages


setup(
    name='PylonsAuthentication',
    version='1.6.3',
    description='Pylons authentication application template',
    author='Roy Hyunjin Han',
    packages=find_packages(),
    include_package_data=True,
    install_requires=['PasteScript>=1.3'],
    entry_points="""
    [paste.paster_create_template]
    pylons_authentication=invisibleroads.pylons.util:PylonsAuthentication
    """)
