#!/bin/bash

# --- 1. Загрузка переменных из .env ---
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# --- 2. Парсинг аргументов командной строки ---
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) 
            shift
            # Разделяем KEY=VALUE и экспортируем в окружение
            IFS=' ' read -ra VARS <<< "$1"
            for var in "${VARS[@]}"; do
                export "$var"
            done
            ;;
        *) 
            echo "Неизвестный аргумент: $1"
            exit 1
            ;;
    esac
    shift
done

# --- 3. Запуск Python-скрипта ---
echo "Запуск main.py с переменными:"
python3 main.py
