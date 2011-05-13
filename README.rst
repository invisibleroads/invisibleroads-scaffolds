Pyramid application templates based on invisibleroads.com
=========================================================
The Pyramid templates in this package provide user account management based on `invisibleroads.com <http://invisibleroads.com>`_.

`Pyramid <http://docs.pylonsproject.org/docs/pyramid.html>`_ is a web application framework that is the successor to `Pylons <http://pylonshq.com/>`_ and `repoze.bfg <http://bfg.repoze.org/>`_.  Thanks to Chris McDonough, Mike Bayer, Mike Orr, Ben Bangert and the other developers of Pyramid, Pylons and Python.


Installation
------------
::

    # Prepare isolated environment
    PYRAMID_ENV=$HOME/pyramid-env
    virtualenv --no-site-packages $PYRAMID_ENV 
    # Activate isolated environment
    source $PYRAMID_ENV/bin/activate
    # Install packages
    pip install ipython ipdb nose coverage invisibleroads-templates


Usage
-----
::

    # Activate isolated environment
    source $PYRAMID_ENV/bin/activate

    # List available templates
    paster create --list-templates
    # Create an application
    paster create -t ir_core xxx

    # Change to application's folder
    cd xxx
    # Install dependencies
    python setup.py develop

    # Edit sensitive information
    vim .test.ini
    # Run tests with coverage
    nosetests --pdb --pdb-failures
    # Show URL routes
    paster proutes development.ini xxx
    # Run shell
    paster pshell development.ini xxx

    # Edit sensitive information
    vim .development.ini
    # Start development server
    paster serve --reload development.ini

    # Edit sensitive information
    vim .production.ini
    # Start production server
    paster serve --daemon production.ini

    # Edit and install crontab.crt
    vim deployment/crontab.crt
    crontab deployment/crontab.crt
