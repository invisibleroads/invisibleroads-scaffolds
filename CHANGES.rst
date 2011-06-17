1.7.5
-----
- Restructured user roles and permissions
- Used User.role instead of User.is_super and User.is_active
- Used argparse instead of optparse in utilities/script_process
- Added row-based interface example in templates/rows/index.mak_tmpl
- Added users.unpack_properties() for more flexible property retrieval


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
