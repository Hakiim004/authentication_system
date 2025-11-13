import hashlib
import secrets
# text = "bonjour  comment"
# hash_object = hashlib.md5(text.encode())
# print(hash_object.hexdigest())

def hashText(text):
    salt = secrets.token_hex(2000)
    hash_object = hashlib.sha256((text + salt).encode())
    print(hash_object.hexdigest())


hashText("salut")

