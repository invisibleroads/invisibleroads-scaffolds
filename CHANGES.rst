1.8.0
-----
- Added openID support
- Added SMSAddress registration confirmation
- Added UploadsCached validator
- Added utilities/update.sh
- Changed signature for cellToggle(tdSelector, options)
- Changed signature for $.fn.prepareTableOverlayForm($table, trSelector)
- Fixed IE compatibility issues
- Used jquery.tokenInput.min.js instead of jquery.autoComplete.min.js

1.7.9
-----
- Added alternate server utilities/serve.py using gevent
- Added autoCompleteProxy() to replace select controls that have many options
- Added User.unpack_properties to replace unpack_user_properties
- Added parameter SITE_DOMAIN
- Added users.mail_users()
- Fixed timezoneOffset initialization to handle negative offsets
- Fixed clickToggle() so that flag matches size and color of parent
- Moved robots.txt into static folder
- Updated validators
- Used request.static_path() instead of request.static_url() to support https

1.7.8
-----
- Incorporated enhancements from Pyramid 1.2
- Updated forms to use vertical format
- Reorganized sensitive configuration file format
- Placed common form validators in validators.py
- Added email notification to leaders when a new account requires activation
- Added email notification to user when account is activated or promoted
- Added support for form tabs and tooltips
- Added support for formTips by className as well as name
- Added port-locking to command-line scripts to ensure singleton instances
- Added tests for 100% code coverage for PostgreSQL
- Rewrote testing framework

1.7.7
-----
- Added AJAX style file uploads
- Rewrote javascript for form enhancements
- Rewrote javascript for table enhancements
- Updated SMS address management interface in users/change.mako
- Fixed evaluation of settings['debug_templates']

1.7.6
-----
- Increased test coverage to 100% given SMS IMAP configuration
- Enforced model-side case-insensitive evaluation of encrypted email addresses
- Fixed user account administrative interface in users/index.mako
- Added User.is_member and User.is_leader hybrid properties for flexibility
- Updated code to be compatible with Pyramid 1.1a4

1.7.5
-----
- Restructured user roles and permissions
- Used User.role instead of User.is_super and User.is_active
- Used argparse instead of optparse in utilities/script_process.py
- Added users.unpack_properties() for more flexible property retrieval
- Added row-based interface example

1.7.4
-----
- Added robots.txt with default exclusion from search engine crawlers
- Added get_remote_ip()
- Added $.ajaxSetup for general error handling
- Used prop('disabled', true) instead of attr('disabled', 'disabled')
- Used e.which instead of e.keyCode
- Upgraded to jQuery 1.6.1

1.7.3
-----
- Changed to cryptacular.bcrypt() for password hash
- Changed to urandom() for authtkt.secret and session.secret
- Added server-side check for user.is_active, user.is_super
- Let superuser activate or deactivate other users
- Added mechanism for user to invalidate other sessions
- Moved imapIO to a separate package in PyPI
- Reverted SMS address registration so that users register by sending an SMS
- Increased test coverage to 96%

1.7.2
-----
- Added test for unicode usernames, passwords, nicknames, emails
- Fixed username, password, nickname, email to be unicode-friendly
- Fixed tools.hash, tools.encrypt, tools.decrypt to be unicode-friendly
- Created SQLAlchemy types Encrypted, LowercaseEncrypted
- Encrypted the storage of email addresses
- Let superusers promote or demote other users
- Added redirect to login page if AJAX request does not return JSON
- Set poolclass to sqlalchemy.NullPool for SQLite file-based databases

1.7.1
-----
- Moved whenIO to a separate package in PyPI

1.7.0
-----
- Migrated from Pylons to Pyramid
- Changed authentication from Beaker sessions to AuthTkt cookies
- Changed authorization from manual enforcement to ACLAuthorizationPolicy
- Restored ability to set sensitive information in dotted configuration files
- Updated javascript event binding to use jQuery's live()
- Changed SMS address registration so that user enters SMS address manually
- Added timezone offset display functionality to whenIO
- Added DataTables jQuery plugin to user list page
