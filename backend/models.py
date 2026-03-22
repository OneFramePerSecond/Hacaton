from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    subscriptions = relationship("Subscription", back_populates="owner")

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    period = Column(String)  # monthly, yearly
    category = Column(String)
    start_date = Column(Date)
    next_billing_date = Column(Date)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="subscriptions")