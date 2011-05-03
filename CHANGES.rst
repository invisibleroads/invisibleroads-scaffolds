1.7.3
-----
- Changed to urandom() for authtkt.secret and session.secret
- Changed to cryptacular.bcrypt() for password hash


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
