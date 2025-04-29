import sqlalchemy
from sqlalchemy import and_, delete
from DataBaseManager.__init__ import db
from DataBaseManager.models import Tasks, Lessons, LessonsDepends, TeacherSolutions, StudentSolutions
import logging

class DatabaseTasks:
    def __init__(self, db):
        self.db = db

    def add_task(self, lesson_id, description, test=None):#, test=None, compl_solution_id=None):
        """Добавляет новую задачу к уроку"""
        with self.db.create_session() as session:
            task = Tasks(
                lesson_id=lesson_id,
                description=description,
                test=test,
                compl_solution_id=None,
                created_at=sqlalchemy.func.now()
            )
            session.add(task)
            session.commit()
            session.refresh(task)
            return task

    def delete_task(self, task_id):
        """Удаляет задачу и связанные с ней решения (как учеников, так и учителей)"""
        with self.db.create_session() as session:
            try:
                # Удаляем связанные решения учеников
                session.execute(delete(StudentSolutions).where(StudentSolutions.task_id == task_id))
                # Удаляем связанные решения учителей
                session.execute(delete(TeacherSolutions).where(TeacherSolutions.task_id == task_id))
                # Удаляем саму задачу
                session.execute(delete(Tasks).where(Tasks.id == task_id))
                session.commit()
                return True
            except Exception as e:
                session.rollback()
                logging.error(f"Error deleting task: {e}")
                return False

    def update_task(self, task_id, description=None, test=None, solution=None):  # Добавлен параметр test
        """Редактирует описание задачи и тестовые данные"""
        update_data = {}
        if description is not None:
            update_data['description'] = description
        if test is not None:  # Добавлено обновление тестовых данных
            update_data['test'] = test
        if solution is not None:  # Добавлено обновление тестовых данных
            update_data['compl_solution_id'] = solution

        if not update_data:
            return None

        with self.db.create_session() as session:
            task = session.get(Tasks, task_id)
            if task:
                for key, value in update_data.items():
                    setattr(task, key, value)
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