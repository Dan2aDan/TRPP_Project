# Платформа для обучения с автопроверкой программирования на питоне
## 🚀 Запуск проекта на FastAPI

## 📋 Описание проекта
Проект создан на базе **FastAPI** с использованием **Uvicorn** для запуска веб-сервера. В данном руководстве описаны шаги по установке зависимостей и запуску проекта.

---

## 📂 Структура проекта
```
📂 .venv/                # Виртуальное окружение
📂 DataBaseManager/      # Управление базой данных
├── __init__.py
└── models.py           # Описание моделей БД 
📂 utils/                # Утилиты
└── logger.py           # Логирование
📂 routers/ # Общие роутеры для потоков запросов с общей приставкой
📄 .gitignore     # Игнорируемые файлы
📄 main.py               # Основной файл приложения
📄 models.py             # Модели для API
📄 requirements.txt      # Файл зависимостей
📄 .env Переменные окружения
```

---

## ⚙️ Установка и запуск проекта

### 1️⃣ Установить Python 3.10+
[Скачать Python](https://www.python.org/downloads/)

### 2️⃣ Клонировать репозиторий
```bash
git clone https://github.com/LastNightMoon/TRPP_Project
```

### 3 Создать виртуальное окружение и активировать его
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/MacOS
.venv\\Scripts\\activate   # Windows
```

### 4 Установить зависимости
```bash
pip install -r requirements.txt
```
### 5 Переменные окружения
Создать файл .env и вставить в него то, что ниже, но заполнить данными
```nano
DBUSER=
DBPASSWORD=
DBHOST=
DBNAME=
SECRET_KEY=
```

### 6 Запустить проект
```bash
python main.py
```

---

## 🚀 Проверка работы сервера
- **Swagger UI:** http://127.0.0.1:8000/docs  
- **Root Endpoint:** http://127.0.0.1:8000  

---

## 📌 Полезные команды
- **Создать файл зависимостей:**
  ```bash
  pip freeze > requirements.txt
  ```
- **Установить зависимости из файла:**
  ```bash
  pip install -r requirements.txt
  ```
- **Деактивировать виртуальное окружение:**
  ```bash
  deactivate
  ```
