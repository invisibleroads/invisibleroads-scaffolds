'IMAP mailbox wrapper'
# Import system modules
import email
import email.Utils
import email.parser
import email.header
import mimetypes
import datetime
import imaplib
import random
import time
import re
import os
# Import custom modules
import mail_format


# Set patterns
pattern_whitespace = re.compile(r'\s+')


# Interface for IMAP4
class Store(object):

    # Connection

    def __init__(self, mailHost, mailName, mailPassword):
        # Connect
        try:
            self.server = imaplib.IMAP4(mailHost)
            self.server.login(mailName, mailPassword)
        except AttributeError, error:
            raise IMAPError(error)
        except imaplib.IMAP4.error, error:
            raise IMAPError(error)
        # Save
        self.mailHost = mailHost
        self.mailName = mailName

    def __del__(self):
        # Disconnect
        self.server.logout()

    def __repr__(self):
        return '%s@%s' % (self.mailName, self.mailHost)

    # Read

    def read(self, includes=None, excludes=None):
        # Get folderPacks
        folderPacks = self.getFolderPacks(includes, excludes)
        random.shuffle(folderPacks)
        # Prepare
        pattern_imap_uid = re.compile(r'UID (\d+)')
        # For each folderPack,
        for folderName, tagTexts in folderPacks:
            # Select folder
            messageCount = int(self.server.select(folderName)[1][0])
            messageIndices = list(range(1, messageCount + 1))
            random.shuffle(messageIndices)
            # For each message,
            for messageIndex in messageIndices:
                # Get
                try:
                    data = self.server.fetch(messageIndex, '(BODY.PEEK[HEADER.FIELDS (SUBJECT FROM TO CC BCC DATE)] UID)')[1]
                # If the connection died,
                except imaplib.IMAP4.abort:
                    # Return
                    return
                try:
                    # Try to extract a uid
                    match = pattern_imap_uid.search(data[1])
                    # If there is no match,
                    if not match:
                        # Try again
                        match = pattern_imap_uid.search(data[0][0])
                # If we have an error,
                except IndexError:
                    # Skip it
                    continue
                # If we have a match,
                if match:
                    # Yield
                    yield Message(self, tagTexts, int(match.group(1)), data[0][1])

    # Get

    def getFolderPacks(self, includes=None, excludes=None):
        # Initialize
        folderPacks = []
        includes = map(mail_format.prepareTagText, includes) if includes else []
        excludes = map(mail_format.prepareTagText, excludes) if excludes else []
        lines = self.server.list()[1]
        pattern_imap_folder_list = re.compile(r'\((?P<flags>.*?)\) "(?P<delimiter>.*)" (?:\{.*\})?(?P<name>.*)')
        # For each line,
        for line in lines:
            # If the line is empty, skip it
            if not line: 
                continue
            # If the line is a tuple, join them
            if isinstance(line, tuple): 
                line = ' '.join(line)
            # Extract
            folderName = pattern_imap_folder_list.match(line).groups()[2].lstrip()
            tagTexts = set(map(mail_format.prepareTagText, folderName.replace('&-', '&').split('\\')))
            # If we do not have tags from the exclude list,
            if not tagTexts.intersection(excludes):
                # If no includes are defined or we have tags from the includes list,
                if not includes or tagTexts.intersection(includes):
                    folderPacks.append((folderName, tagTexts))
        # Return
        return folderPacks

    # Revive

    def revive(self, folder, message, when):
        """
        Revive the message on the mail server; includes workaround when 
        folder exists on mail server with different capitalized letters
        """
        # Try to find the folder on the mail server
        folderPacks = self.getFolderPacks(includes=[folder])
        # If the folder does not exist,
        if not folderPacks:
            # Create folder
            self.server.create(folder)
        # If the folder exists,
        else:
            # Get the exact name of the folder on the mail server
            folder = folderPacks[0][0]
        # Append
        return self.server.append(folder, '', imaplib.Time2Internaldate(when.timetuple()), str(message))

    # Expunge

    def expunge(self):
        'Purge messages flagged for deletion'
        self.server.expunge()


class Message(object):

    # Constructor

    def __init__(self, mailbox, tagTexts, uid, mimeString):
        # Save document
        self.mailbox = mailbox
        self.tagTexts = tagTexts
        self.uid = uid
        # Extract messages
        headerParser = email.parser.HeaderParser()
        message = headerParser.parsestr(mimeString)
        # Define
        def getWhom(name):
            if not name in message: return ''
            return pattern_whitespace.sub(' ', email.header.decode_header(message[name])[0][0])
        # Extract fields
        self.subject = mail_format.unicodeSafely(pattern_whitespace.sub(' ', email.header.decode_header(message['Subject'] if 'Subject' in message else '')[0][0])).strip()
        self.fromWhom = mail_format.unicodeSafely(getWhom('From'))
        self.toWhom = mail_format.unicodeSafely(getWhom('To'))
        self.ccWhom = mail_format.unicodeSafely(getWhom('CC'))
        self.bccWhom = mail_format.unicodeSafely(getWhom('BCC'))
        self.when = datetime.datetime.fromtimestamp(time.mktime(email.Utils.parsedate_tz(message['Date'])[:9])) if 'Date' in message else None
        self.tags = map(mail_format.unicodeSafely, tagTexts)

    # Get

    def __getitem__(self, key):
        return getattr(self, key)

    # Set

    def __setitem__(self, key, value):
        return setattr(self, key, value)

    # Mark

    def markUnread(self):
        self.mailbox.server.uid('store', self.uid, '-FLAGS', r'(\Seen)')

    def markDeleted(self):
        self.mailbox.server.uid('store', self.uid, '+FLAGS', r'(\Deleted)')

    # Is

    def isUnread(self):
        messageFlags = imaplib.ParseFlags(self.mailbox.server.uid('fetch', self.uid, '(FLAGS)')[1][0])
        if r'\Seen' not in messageFlags:
            return True

    # Export

    def save(self, targetFolderPath):
        # Save tags
        open(os.path.join(targetFolderPath, 'tags.txt'), 'wt').write('\n'.join(self.tags))
        # Save header
        open(os.path.join(targetFolderPath, 'header.txt'), 'wt').write(mail_format.formatHeader(self.subject, self.when, self.fromWhom, self.toWhom, self.ccWhom, self.bccWhom))
        # Set shortcut
        server = self.mailbox.server
        try:
            # Save unread status
            isUnread = self.isUnread()
            # Load message
            message = email.message_from_string(server.uid('fetch', self.uid, '(RFC822)')[1][0][1])
            # Restore flags
            if isUnread:
                self.markUnread()
        except imaplib.IMAP4.abort:
            open('part000.txt', 'wt').write(str(error))
            return
        # Save parts
        counter = 1
        for part in message.walk():
            # If the content is multipart, then enter the container
            if part.get_content_maintype() == 'multipart':
                continue
            # Get payload
            payload = part.get_payload(decode=True)
            # Applications should really sanitize the given filename so that an
            # email message can't be used to overwrite important files
            filename = part.get_filename()
            if not filename:
                # Get contentType
                contentType = part.get_content_type()
                # If the content is text,
                if contentType == 'text/plain':
                    extension = '.txt'
                    payload = mail_format.unicodeSafely(payload.strip())
                else:
                    extension = mimetypes.guess_extension(contentType)
                    # If we could not guess an extension,
                    if not extension:
                        # Use generic extension
                        extension = '.bin'
                filename = 'part%03d%s' % (counter, extension)
            else:
                filename = mail_format.sanitizeFileName(filename)
            # If there is a payload to save,
            if payload:
                # Save it
                counter += 1
                fp = open(os.path.join(targetFolderPath, filename), 'wb')
                fp.write(payload)
                fp.close()
        # Return
        return True


# Exception

class IMAPError(Exception):
    pass
