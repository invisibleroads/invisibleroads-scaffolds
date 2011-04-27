'General purpose tools'
import hashlib
import random
from Crypto.Cipher import AES as Cipher


alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
secret1 = ''
secret2 = alphabet[:32]


def hash_string(string): 
    'Compute the hash of the string'
    return hashlib.sha256(string + secret1).digest()


def encrypt(string):
    'Encrypt the string'
    return Cipher.new(secret2).encrypt(string)


def decrypt(string):
    'Decrypt the string'
    return Cipher.new(secret2).decrypt(string)


def make_random_string(length):
    'Return a random string of a specified length'
    return ''.join(random.choice(alphabet) for x in xrange(length))


def make_random_unique_string(length, is_unique):
    """
    Return a random unique string given a function that
    checks whether the string is unique
    """
    # Initialize
    iterationCount = 0
    permutationCount = len(alphabet) ** length
    while iterationCount < permutationCount:
        # Make randomID
        randomID = make_random_string(length)
        iterationCount += 1
        # If our randomID is unique, return it
        if is_unique(randomID):
            return randomID
    # Raise exception if we have no more permutations left
    raise RuntimeError('Could not create a unique string')
