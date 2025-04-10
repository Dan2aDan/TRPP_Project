from requests import Session
import sqlalchemy
from sqlalchemy import and_, delete
from DataBaseManager.__init__ import db
from DataBaseManager.models import Students, Teachers, Lessons, Tasks, Solutions


class DatabaseLessons:
    def __init__(self, db):
        self.db = db

    def get_user_lessons(self, user_id, is_teacher=False):
        if is_teacher:
            # Для преподавателя - все уроки, которые он создал
            query = sqlalchemy.select(Lessons).where(Lessons.teacher_id == user_id)
        else:
            # Для студента - уроки его преподавателя
            query = sqlalchemy.select(Lessons).join(Teachers).join(Students).where(Students.id == user_id)

        return self.db.select(query, types=db.all_)

    def get_lesson_tasks(self, lesson_id, user_id=None, is_teacher=False):
        query = sqlalchemy.select(Tasks).where(Tasks.lesson_id == lesson_id)
        return self.db.select(query, types=db.all_)
    
    def add_lesson(self, title, content, teacher_id, file_id):
        try:
            # Создаём новый урок
            new_lesson = {
                'title': title,
                'content': content,
                'teacher_id': teacher_id,
                'file_id': file_id,
                'created_at': sqlalchemy.func.now()  # Устанавливаем текущую дату
            }
            
            # Добавляем урок в базу данных
            self.db.execute_commit(sqlalchemy.insert(Lessons).values(**new_lesson))
            
            # Получаем и возвращаем созданный урок
            query = sqlalchemy.select(Lessons).where(
                and_(
                    Lessons.teacher_id == teacher_id,
                    Lessons.title == title
                )
            ).order_by(Lessons.created_at.desc())
            
            return self.db.select(query, types=db.any_)
        except Exception as e:
            print(f"Ошибка при добавлении урока: {e}")
            return None

db_lessons = DatabaseLessons(db)