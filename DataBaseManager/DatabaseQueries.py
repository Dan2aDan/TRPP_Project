# DatabaseQueries.py
from requests import Session
import sqlalchemy
from sqlalchemy import and_, delete
from DataBaseManager.__init__ import db
from DataBaseManager.models import Students, Teachers, Lessons, Tasks, Solutions


class DatabaseQueries:
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

    def get_teacher_students(self, teacher_id):
        query = sqlalchemy.select(Students).where(Students.teacher_id == teacher_id)
        return self.db.select(query, types=db.all_)

    def update_student(self, student_id, login=None, password_hash=None, bio=None, teacher_id=None):
        update_data = {}
        if login is not None:
            update_data['login'] = login
        if password_hash is not None:
            update_data['password_hash'] = password_hash
        if bio is not None:
            update_data['bio'] = bio
        if teacher_id is not None:
            update_data['teacher_id'] = teacher_id

        if not update_data:
            return None

        with self.db.create_session() as session:
            student = session.get(Students, student_id)
            if student:
                for key, value in update_data.items():
                    setattr(student, key, value)
                session.commit()
                session.refresh(student)
            session.close()
            return student

    def delete_student(self, student_id):
        with self.db.create_session() as session:
            try:
                session.execute(delete(Solutions).where(Solutions.student_id == student_id))
                session.execute(delete(Students).where(Students.id == student_id))

                session.commit()
                return True
            except Exception as e:
                session.rollback()
                print(f"Error deleting student: {e}")
                return False
            finally:
                session.close()


db_queries = DatabaseQueries(db)
