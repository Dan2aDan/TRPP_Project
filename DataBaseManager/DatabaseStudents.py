from requests import Session
import sqlalchemy
from sqlalchemy import and_, delete
from DataBaseManager.__init__ import db
from DataBaseManager.models import Students, StudentSolutions


class DatabaseStudents:
    def __init__(self, db):
        self.db = db

    def register_student(self, login, password, teacher_id):
        self.db.execute_commit(
            sqlalchemy.insert(Students).values(login=login, password_hash=password, bio="", teacher_id=teacher_id))
        return self.db.select(sqlalchemy.select(Students).where(Students.login == login), self.db.any_)

    def get_student_by_id(self, student_id):
        query = sqlalchemy.select(Students).where(Students.id == student_id)
        return self.db.select(query, types=db.any_)

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
                session.execute(delete(StudentSolutions).where(StudentSolutions.student_id == student_id))
                session.execute(delete(Students).where(Students.id == student_id))

                session.commit()
                return True
            except Exception as e:
                session.rollback()
                print(f"Error deleting student: {e}")
                return False
            finally:
                session.close()


db_students = DatabaseStudents(db)
