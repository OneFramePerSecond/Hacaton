from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

import database
import models
from auth import get_current_active_user

router = APIRouter()

@router.get("/notifications")
def get_notifications(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    today = date.today()
    upcoming = today + timedelta(days=3)
    subs = db.query(models.Subscription).filter(
        models.Subscription.user_id == current_user.id,
        models.Subscription.next_billing_date.between(today, upcoming)
    ).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "next_billing_date": s.next_billing_date.isoformat(),
            "price": s.price,
            "days_left": (s.next_billing_date - today).days
        }
        for s in subs
    ]