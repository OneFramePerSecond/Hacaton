import os
import json
import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
import database
import models
from auth import get_current_active_user

router = APIRouter()

# Модель для тела запроса
class ImportRequest(BaseModel):
    email_text: str

# Groq API 
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def parse_email_with_llama(email_text: str):
    """Отправляет текст письма в Llama 3.3 70B (Groq) и возвращает структурированные данные"""
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
Ты — ассистент по анализу писем. Извлеки из текста информацию о подписке.
Верни ответ строго в формате JSON (без других слов, только JSON):
{{
  "name": "название сервиса",
  "price": сумма списания (число),
  "period": "monthly" или "yearly",
  "category": "Video|Music|Cloud|Social|Other",
  "next_billing_date": "YYYY-MM-DD"
}}
Если данных нет, верни null.

Текст письма:
{email_text}
"""
    
    payload = {
        "model": "llama-3.3-70b-versatile",  # бесплатная модель
        "messages": [
            {"role": "system", "content": "Ты ассистент по извлечению данных из писем о подписках. Отвечай только JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0,
        "response_format": {"type": "json_object"}
    }
    
    try:
        response = requests.post(GROQ_URL, headers=headers, json=payload)
        print(f"Groq API status: {response.status_code}")
        print(f"Groq API response: {response.text[:500]}")
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        result = json.loads(content)
        return result if result else None
    except Exception as e:
        print(f"Groq API error: {e}")
        return None

@router.post("/import")
def import_subscriptions(
    req: ImportRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    email_text = req.email_text
    if not email_text or not email_text.strip():
        raise HTTPException(status_code=400, detail="Текст письма не может быть пустым")
    
    print(f"Received email_text: {email_text[:200]}...")
    
    parsed = parse_email_with_llama(email_text)
    if not parsed:
        raise HTTPException(status_code=400, detail="Не удалось извлечь данные из письма")
    
    required_fields = ["name", "price", "period", "category", "next_billing_date"]
    for field in required_fields:
        if field not in parsed:
            raise HTTPException(status_code=400, detail=f"Отсутствует поле {field} в извлечённых данных")
    
    try:
        new_sub = models.Subscription(
            name=parsed["name"],
            price=float(parsed["price"]),
            period=parsed["period"],
            category=parsed["category"],
            start_date=datetime.now().date(),
            next_billing_date=datetime.strptime(parsed["next_billing_date"], "%Y-%m-%d").date(),
            user_id=current_user.id
        )
        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return {"status": "ok", "imported": [new_sub.name]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка при создании подписки: {str(e)}")