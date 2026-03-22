from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
import database
import models
from auth import get_current_active_user

router = APIRouter()

DEMO_SUBSCRIPTIONS = [
    {"name": "Netflix", "price": 999, "period": "monthly", "category": "Video", "start_date": date.today() - timedelta(days=30), "next_billing_date": date.today() + timedelta(days=2)},
    {"name": "Яндекс.Плюс", "price": 299, "period": "monthly", "category": "Music", "start_date": date.today() - timedelta(days=15), "next_billing_date": date.today() + timedelta(days=15)},
    {"name": "Okko", "price": 799, "period": "monthly", "category": "Video", "start_date": date.today() - timedelta(days=10), "next_billing_date": date.today() + timedelta(days=20)},
    {"name": "VK Combo", "price": 399, "period": "monthly", "category": "Social", "start_date": date.today() - timedelta(days=5), "next_billing_date": date.today() + timedelta(days=25)},
    {"name": "Dropbox", "price": 900, "period": "yearly", "category": "Cloud", "start_date": date.today() - timedelta(days=100), "next_billing_date": date.today() + timedelta(days=265)},
]

@router.post("/import")
def import_subscriptions(
    email: Optional[str] = None,
    password: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    created = []
    for sub_data in DEMO_SUBSCRIPTIONS:
        db_sub = models.Subscription(**sub_data, user_id=current_user.id)
        db.add(db_sub)
        created.append(sub_data["name"])
    db.commit()
    return {"status": "ok", "imported": created}