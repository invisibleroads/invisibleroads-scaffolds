Pyramid application scaffolds based on invisibleroads.com
=========================================================
The Pyramid scaffolds in this package provide user account management based on `invisibleroads.com <http://invisibleroads.com>`_.

`Pyramid <http://docs.pylonsproject.org/docs/pyramid.html>`_ is a web application framework that is the successor to `Pylons <http://pylonshq.com/>`_ and `repoze.bfg <http://bfg.repoze.org/>`_.  Thanks to Chris McDonough, Mike Bayer, Mike Orr, Ben Bangert and the other developers of Pyramid, Pylons and Python.


Installation
------------
::

    # Prepare isolated environment
    PYRAMID_ENV=$HOME/Projects/pyramid-env
    virtualenv --no-site-packages $PYRAMID_ENV 
    # Activate isolated environment
    source $PYRAMID_ENV/bin/activate
    # Install packages
    pip install ipython ipdb nose coverage invisibleroads-scaffolds


Usage
-----
::

    # Activate isolated environment
    source $PYRAMID_ENV/bin/activate
    # Enter workspace
    PROJECTS=$HOME/Projects
    cd $PROJECTS
    # List available scaffolds
    paster create --list-templates
    # Create an application
    paster create -t ir_core
