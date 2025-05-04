import sqlalchemy
from sqlalchemy import and_, delete
from DataBaseManager.__init__ import db
from DataBaseManager.models import Tasks, Lessons, LessonsDepends, TeacherSolutions, StudentSolutions
import logging


class DatabaseTasks:
    def __init__(self, db):
        self.db = db

    def add_task(self, lesson_id, description, test=None, file_id=None):
        """Добавление новой задачи к уроку"""
        with self.db.create_session() as session:
            task = Tasks(
                lesson_id=lesson_id,
                description=description,
                test=test,
                compl_solution_id=None,
                file_id=file_id,
                created_at=sqlalchemy.func.now()
            )
            session.add(task)
            session.commit()
            session.refresh(task)
            return task

    def delete_task(self, task_id):
        """Удаление задачи"""
        with self.db.create_session() as session:
            try:
                # Удаляем связанные решения учеников
                task: Tasks = session.query(Tasks).filter(Tasks.id == task_id).one()

                session.execute(delete(StudentSolutions).where(StudentSolutions.task_id == task_id))
                session.execute(delete(Tasks).where(Tasks.id == task_id))

                # Удаляем связанные решения учителей
                session.execute(delete(TeacherSolutions).where(TeacherSolutions.id == task.compl_solution_id))
                # Удаляем саму задачу
                session.commit()
                return True
            except Exception as e:
                session.rollback()
                logging.error(f"Ошибка при удалении задачи: {e}")
                return False

    def update_task(self, task_id, description=None, test=None, solution=None, file_id=None):
        """Обновляет задачу"""
        update_data = {}
        if description is not None:
            update_data['description'] = description
        if test is not None:
            update_data['test'] = test
        if solution is not None:
            update_data['compl_solution_id'] = solution
        if file_id is not ...:
            update_data['file_id'] = file_id

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
        """Получает все задачи из всех уроков."""
        query = sqlalchemy.select(Tasks)
        return self.db.select(query, types=self.db.all_)

    def get_lesson_tasks(self, lesson_id):
        """Получает все задачи конкретного урока."""
        query = sqlalchemy.select(Tasks).where(Tasks.lesson_id == lesson_id)
        return self.db.select(query, types=self.db.all_)

    def get_task_by_id(self, task_id) -> Tasks:
        """Получает задачу по ID."""
        query = sqlalchemy.select(Tasks).where(Tasks.id == task_id)
        return self.db.select(query, types=self.db.any_)

    def get_student_tasks(self, student_id):
        """Получает все задачи ученика (через назначенные уроки)."""
        query = sqlalchemy.select(Tasks).join(Lessons).join(LessonsDepends).where(
            LessonsDepends.student_id == student_id
        )
        return self.db.select(query, types=self.db.all_)

    def get_teacher_tasks(self, teacher_id):
        """Получает все задачи учителя (через его уроки)."""
        query = sqlalchemy.select(Tasks).join(Lessons).where(
            Lessons.teacher_id == teacher_id
        )
        return self.db.select(query, types=self.db.all_)


db_tasks = DatabaseTasks(db)
