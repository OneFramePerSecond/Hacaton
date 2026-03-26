# SubControl — Монитор подписок

## Требования
- Python 3.10+
- Node.js 18+
- npm
- Android Studio (для эмулятора мобилки)

## Запуск бэкенда
1. Перейти в папку `backend`
2. Создать виртуальное окружение: `python -m venv .venv`
3. Активировать: `.venv\Scripts\activate` (Windows) или `source .venv/bin/activate` (Linux/Mac)
4. Установить зависимости: `pip install -r requirements.txt` 
6. Запустить: `uvicorn main:app --host 0.0.0.0 --port 8080 --reload`

## Запуск веб-приложения
1. Перейти в папку `frontend`
2. Выполнить `npm install`
3. Запустить: `npm run dev`
4. Открыть `http://localhost:5173`

## Запуск мобильного приложения (Android эмулятор)
1. Перейти в папку `mobile`
2. Выполнить `npm install`
3. В `mobile/src/api.js` заменить `baseURL` на `http://10.0.2.2:8080` (для эмулятора)
4. Запустить эмулятор Android (через Android Studio)
5. Выполнить `npx expo start --clear` и нажать `a`

## Демонстрация функционала
- Регистрация/логин
- Ручное добавление, редактирование, удаление подписок
- Автоматический импорт из письма (вставьте текст, система через Llama извлечёт данные)
- Аналитика (графики, прогноз)
- Уведомления о скором списании
- Синхронизация между вебом и мобильным приложением

## Ссылки
- Репозиторий: https://github.com/OneFramePerSecond/Hacaton
- Видео обзор: https://drive.google.com/file/d/1RRCATGGd4jNS6INXkgbd3G5-uFuZSlmq/view?usp=drive_link
