from pydantic import BaseModel
from datetime import date
from typing import Optional, List

# Subscription schemas
class SubscriptionBase(BaseModel):
    name: str
    price: float
    period: str
    category: str
    start_date: date
    next_billing_date: date

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(SubscriptionBase):
    pass

class Subscription(SubscriptionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    subscriptions: List[Subscription] = []

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None