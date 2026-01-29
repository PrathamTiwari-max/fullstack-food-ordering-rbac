from pydantic import BaseModel
from typing import List, Optional
from models import Role, Country, OrderStatus

class UserBase(BaseModel):
    name: str
    username: str
    role: str
    country: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class MenuItemBase(BaseModel):
    name: str
    price: float

class MenuItemOut(MenuItemBase):
    id: int
    restaurant_id: int
    class Config:
        from_attributes = True

class RestaurantBase(BaseModel):
    name: str
    country: str

class RestaurantOut(RestaurantBase):
    id: int
    menu_items: List[MenuItemOut] = []
    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int

class OrderItemOut(BaseModel):
    id: int
    menu_item: MenuItemOut
    quantity: int
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    country: str
    items: List[OrderItemOut]
    class Config:
        from_attributes = True

class PaymentMethodBase(BaseModel):
    type: str

class PaymentMethodOut(PaymentMethodBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class PaymentMethodUpdate(PaymentMethodBase):
    pass
