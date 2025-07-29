from pymongo import MongoClient
from datetime import datetime, timezone
import hashlib
import bcrypt


MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "sales_bot"
USERS_COLLECTION = "users"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def insert_user(user_id, email, password, role):
    from pymongo import MongoClient

    client = MongoClient("mongodb://localhost:27017")
    db = client["sales_bot"]
    users = db["users"]

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user_data = {
        "_id": user_id,
        "email": email,
        "password": hashed_password.decode('utf-8'),
        "role": role
    }

    users.insert_one(user_data)
    print("✅ Super Admin inserted")

if __name__ == "__main__":
    # Tambahkan user super admin
    insert_user(
        user_id=1825371102,
        email="superadmin@superadmin",
        password="123",
        role="super_admin"
    )

    # Tambahkan user sales
    insert_user(
        user_id=8163426671,
        email="sales@email.com",
        password="123",
        role="sales"
    )
