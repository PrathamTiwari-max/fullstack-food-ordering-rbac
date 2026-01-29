from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth, database, seed
from fastapi.security import OAuth2PasswordRequestForm

app = FastAPI(title="Avengers Food Ordering System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_db():
    models.Base.metadata.create_all(bind=database.engine)
    # Optional: Automatically seed if users table is empty
    db = database.SessionLocal()
    if not db.query(models.User).first():
        seed.seed_db()
    db.close()

# RBAC and Country Filtering Logic
def check_country_access(current_user: models.User, target_country: str):
    if current_user.role == "ADMIN":
        return True
    if current_user.country == target_country:
        return True
    return False

def require_role(roles: List[str]):
    def role_checker(current_user: models.User = Depends(auth.get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for your role"
            )
        return current_user
    return role_checker

@app.post("/login", response_model=schemas.Token)
def login(db: Session = Depends(database.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- Restaurants & Menu ---
@app.get("/restaurants", response_model=List[schemas.RestaurantOut])
def get_restaurants(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Relational access control by country
    query = db.query(models.Restaurant)
    if current_user.role != "ADMIN":
        query = query.filter(models.Restaurant.country == current_user.country)
    return query.all()

@app.get("/restaurants/{restaurant_id}", response_model=schemas.RestaurantOut)
def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    if not check_country_access(current_user, restaurant.country):
        raise HTTPException(status_code=403, detail="Access denied to this country's data")
    
    return restaurant

# --- Orders ---
@app.post("/orders", response_model=schemas.OrderOut)
def create_order(
    order_in: schemas.OrderCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # RBAC: All roles can create order (add items)
    # Check if all items are in user's country
    for item_in in order_in.items:
        menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_in.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item_in.menu_item_id} not found")
        if not check_country_access(current_user, menu_item.restaurant.country):
            raise HTTPException(status_code=403, detail="Cannot add items from another country")

    new_order = models.Order(user_id=current_user.id, status="PENDING", country=current_user.country)
    db.add(new_order)
    db.flush() # Get order ID

    for item_in in order_in.items:
        order_item = models.OrderItem(
            order_id=new_order.id,
            menu_item_id=item_in.menu_item_id,
            quantity=item_in.quantity
        )
        db.add(order_item)
    
    db.commit()
    db.refresh(new_order)
    return new_order

@app.get("/orders", response_model=List[schemas.OrderOut])
def get_orders(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Order)
    if current_user.role != "ADMIN":
        query = query.filter(models.Order.country == current_user.country)
    return query.all()

@app.post("/orders/{order_id}/checkout", response_model=schemas.OrderOut)
def checkout_order(
    order_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_role(["ADMIN", "MANAGER"]))
):
    # RBAC: Member cannot place order (checkout & pay)
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if not check_country_access(current_user, order.country):
        raise HTTPException(status_code=403, detail="Access denied to this country's data")
    
    order.status = "COMPLETED"
    db.commit()
    return order

@app.post("/orders/{order_id}/cancel", response_model=schemas.OrderOut)
def cancel_order(
    order_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_role(["ADMIN", "MANAGER"]))
):
    # RBAC: Member cannot cancel order
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if not check_country_access(current_user, order.country):
        raise HTTPException(status_code=403, detail="Access denied to this country's data")
    
    order.status = "CANCELLED"
    db.commit()
    return order

# --- Payment Methods ---
@app.get("/payment-methods", response_model=List[schemas.PaymentMethodOut])
def get_payment_methods(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Only users can see their own payment methods, but for simplicity of this demo:
    # Admin can see all, others only their own
    if current_user.role == "ADMIN":
        return db.query(models.PaymentMethod).all()
    return db.query(models.PaymentMethod).filter(models.PaymentMethod.user_id == current_user.id).all()

@app.put("/payment-methods/{pm_id}", response_model=schemas.PaymentMethodOut)
def update_payment_method(
    pm_id: int,
    pm_update: schemas.PaymentMethodUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_role(["ADMIN"]))
):
    # RBAC: Only Admin can update payment method
    pm = db.query(models.PaymentMethod).filter(models.PaymentMethod.id == pm_id).first()
    if not pm:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    pm.type = pm_update.type
    db.commit()
    return pm
