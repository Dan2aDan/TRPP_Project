import sqlalchemy
from sqlalchemy import and_, delete
from DataBaseManager.__init__ import db
from DataBaseManager.models import Tasks, Lessons, Students, Teachers, Solutions, LessonsDepends
import logging

class DatabaseTasks:
    def __init__(self, db):
        self.db = db

    def add_task(self, lesson_id, description):
        """Добавляет новую задачу к уроку"""
        with self.db.create_session() as session:
            task = Tasks(
                lesson_id=lesson_id,
                description=description,
                created_at=sqlalchemy.func.now()
            )
            session.add(task)
            session.commit()
            session.refresh(task)
            return task

    def delete_task(self, task_id):
        """Удаляет задачу и связанные с ней решения"""
        with self.db.create_session() as session:
            try:
                # Удаляем связанные решения
                session.execute(delete(Solutions).where(Solutions.task_id == task_id))
                # Удаляем саму задачу
                session.execute(delete(Tasks).where(Tasks.id == task_id))
                session.commit()
                return True
            except Exception as e:
                session.rollback()
                logging.error(f"Error deleting task: {e}")
                return False

    def update_task(self, task_id, description=None):
        """Редактирует описание задачи"""
        with self.db.create_session() as session:
            task = session.get(Tasks, task_id)
            if task:
                if description is not None:
                    task.description = description
                session.commit()
                session.refresh(task)
            return task

    def get_all_tasks(self):
        """Получает все задачи из всех уроков"""
        query = sqlalchemy.select(Tasks)
        return self.db.select(query, types=self.db.all_)

    def get_lesson_tasks(self, lesson_id):
        """Получает все задачи конкретного урока"""
        query = sqlalchemy.select(Tasks).where(Tasks.lesson_id == lesson_id)
        return self.db.select(query, types=self.db.all_)

    def get_task_by_id(self, task_id):
        """Получает задачу по ID"""
        query = sqlalchemy.select(Tasks).where(Tasks.id == task_id)
        return self.db.select(query, types=self.db.any_)

    def get_student_tasks(self, student_id):
        """Получает все задачи ученика (через назначенные уроки)"""
        query = sqlalchemy.select(Tasks).join(Lessons).join(LessonsDepends).where(
            LessonsDepends.student_id == student_id
        )
        return self.db.select(query, types=self.db.all_)

    def get_teacher_tasks(self, teacher_id):
        """Получает все задачи учителя (через его уроки)"""
        query = sqlalchemy.select(Tasks).join(Lessons).where(
            Lessons.teacher_id == teacher_id
        )
        return self.db.select(query, types=self.db.all_)


db_tasks = DatabaseTasks(db)