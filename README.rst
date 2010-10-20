Pylons template with authentication
===================================

Installation
------------
python setup.py install

Usage
-----
paster create --list-templates
paster create -t pylons-authentication xxx
cd xxx
paster setup-app development.ini
paster serve --reload development.ini
paster make-config xxx production.ini
paster serve --daemon production.ini
