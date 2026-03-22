# type: ignore
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from collections import defaultdict
from typing import Dict, List, Any

import database
import models
from auth import get_current_active_user

router = APIRouter()

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    subs = db.query(models.Subscription).filter(models.Subscription.user_id == current_user.id).all()
    
    # БЕК ЗАПУСКАТЬ ЭТОЙ КОМАНДОЙ Я ЗАЕБАЛСЯ ЕЕ ГУГЛИТЬ КАЖДЫЙ РАЗ  uvicorn main:app --host 0.0.0.0 --port 8080 --reload (порт 8080 потому что так в апи прописано мне лень фиксить)
    category_totals: Dict[str, float] = defaultdict(float)  # расходы по категориям (в месяц)
    monthly_totals: Dict[str, float] = defaultdict(float)   # динамика по месяцам
    yearly_forecast: float = 0.0

    today = date.today()

    for sub in subs:
        price = float(sub.price)
        period = str(sub.period)
        category = str(sub.category)

        # Расходы по категориям (приводим к месячным)
        monthly_equivalent = price if period == "monthly" else price / 12.0
        category_totals[category] += monthly_equivalent

        # Прогноз на год (общая сумма за год)
        if period == "monthly":
            yearly_forecast += price * 12.0
        else:
            yearly_forecast += price

        # Динамика по месяцам — распределяем подписки на ближайшие 12 месяцев
        # Берем next_billing_date и добавляем периоды вперед
        current_date = sub.next_billing_date
        for _ in range(12):  # ближайшие 12 месяцев
            month_key = current_date.strftime("%Y-%m")
            monthly_totals[month_key] += monthly_equivalent
            # Сдвигаем дату на следующий период
            if period == "monthly":
                # добавляем месяц
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    current_date = current_date.replace(month=current_date.month + 1)
            else:  # yearly
                current_date = current_date.replace(year=current_date.year + 1)

    # Преобразуем в формат для графиков
    category_data = [{"category": cat, "total": round(val, 2)} for cat, val in category_totals.items()]
    # Сортируем месяцы по дате
    sorted_months = sorted(monthly_totals.keys())
    monthly_data = [{"month": mon, "total": round(monthly_totals[mon], 2)} for mon in sorted_months]

    return {
        "category_totals": category_data,
        "monthly_totals": monthly_data,
        "yearly_forecast": round(yearly_forecast, 2)
    }