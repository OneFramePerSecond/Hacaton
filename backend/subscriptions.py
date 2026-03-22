from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import database
import models
import schemas
from auth import get_current_active_user

router = APIRouter()

@router.get("/subscriptions", response_model=List[schemas.Subscription])
def read_subscriptions(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    subscriptions = db.query(models.Subscription).filter(models.Subscription.user_id == current_user.id).all()
    return subscriptions

@router.post("/subscriptions", response_model=schemas.Subscription)
def create_subscription(
    subscription: schemas.SubscriptionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_subscription = models.Subscription(**subscription.dict(), user_id=current_user.id)
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

@router.put("/subscriptions/{subscription_id}", response_model=schemas.Subscription)
def update_subscription(
    subscription_id: int,
    subscription_update: schemas.SubscriptionUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_subscription = db.query(models.Subscription).filter(
        models.Subscription.id == subscription_id,
        models.Subscription.user_id == current_user.id
    ).first()
    if not db_subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    for key, value in subscription_update.dict().items():
        setattr(db_subscription, key, value)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

@router.delete("/subscriptions/{subscription_id}", status_code=204)
def delete_subscription(
    subscription_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_subscription = db.query(models.Subscription).filter(
        models.Subscription.id == subscription_id,
        models.Subscription.user_id == current_user.id
    ).first()
    if not db_subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    db.delete(db_subscription)
    db.commit()
    return {"ok": True}