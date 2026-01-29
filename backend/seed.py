from database import SessionLocal, engine
import models
import auth

def seed_db():
    db = SessionLocal()
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    # Seed Users
    users = [
        {"name": "Nick Fury", "username": "fury", "role": "ADMIN", "country": "ALL", "password": "password123"},
        {"name": "Captain Marvel", "username": "marvel", "role": "MANAGER", "country": "INDIA", "password": "password123"},
        {"name": "Captain America", "username": "america", "role": "MANAGER", "country": "AMERICA", "password": "password123"},
        {"name": "Thanos", "username": "thanos", "role": "MEMBER", "country": "INDIA", "password": "password123"},
        {"name": "Thor", "username": "thor", "role": "MEMBER", "country": "INDIA", "password": "password123"},
        {"name": "Travis", "username": "travis", "role": "MEMBER", "country": "AMERICA", "password": "password123"},
    ]

    for user_data in users:
        hashed_pw = auth.get_password_hash(user_data["password"])
        user = models.User(
            name=user_data["name"],
            username=user_data["username"],
            role=user_data["role"],
            country=user_data["country"],
            hashed_password=hashed_pw
        )
        db.add(user)
    
    db.commit()

    # Seed Restaurants
    restaurants = [
        {"name": "Taj Mahal Delights", "country": "INDIA"},
        {"name": "Spice Route", "country": "INDIA"},
        {"name": "Liberty Burger", "country": "AMERICA"},
        {"name": "Empire Steakhouse", "country": "AMERICA"},
    ]

    for r_data in restaurants:
        restaurant = models.Restaurant(name=r_data["name"], country=r_data["country"])
        db.add(restaurant)
    
    db.commit()

    # Seed Menu Items
    menu_items = [
        {"restaurant_id": 1, "name": "Butter Chicken", "price": 450.0},
        {"restaurant_id": 1, "name": "Naan", "price": 50.0},
        {"restaurant_id": 2, "name": "Biryani", "price": 350.0},
        {"restaurant_id": 3, "name": "Cheeseburger", "price": 12.0},
        {"restaurant_id": 3, "name": "Fries", "price": 4.0},
        {"restaurant_id": 4, "name": "T-Bone Steak", "price": 45.0},
    ]

    for m_data in menu_items:
        item = models.MenuItem(**m_data)
        db.add(item)

    db.commit()
    
    # Seed Payment Methods for some users
    payment_methods = [
        {"user_id": 1, "type": "CREDIT_CARD"},
        {"user_id": 2, "type": "UPI"},
        {"user_id": 3, "type": "DEBIT_CARD"},
        {"user_id": 4, "type": "UPI"},
        {"user_id": 5, "type": "CASH"},
        {"user_id": 6, "type": "CREDIT_CARD"},
    ]
    
    for p_data in payment_methods:
        pm = models.PaymentMethod(**p_data)
        db.add(pm)
        
    db.commit()
    db.close()
    print("Database seeded!")

if __name__ == "__main__":
    seed_db()
