try:
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages


setup(
    name='InvisibleRoadsTemplate',
    version="1.6",
    description="Pylons template with authentication",
    author="Roy Hyunjin Han",
    packages=find_packages(),
    include_package_data=True,
    install_requires=["PasteScript>=1.3"],
    entry_points="""
    [paste.paster_create_template]
    invisibleroads=invisibleroads.pylons.util:InvisibleRoadsTemplate
    """,
)
