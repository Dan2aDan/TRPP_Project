import sqlalchemy
from sqlalchemy import and_
from DataBaseManager.__init__ import db
from DataBaseManager.models import Students, Teachers


class UserManager:
    def __init__(self, db):
        self.db = db

    def is_student(self, login, password):
        query = sqlalchemy.select(Students).where(and_(Students.login == login, Students.password_hash == password))
        return self.db.select(query, types=self.db.any_)

    def is_teacher(self, login, password):
        query = sqlalchemy.select(Teachers).where(and_(Teachers.login == login, Teachers.password_hash == password))
        return self.db.select(query, types=self.db.any_)

    def get_user_type(self, login, password):
        student = self.is_student(login, password)
        if student:
            return student

        teacher = self.is_teacher(login, password)
        if teacher:
            return teacher

        return None


user_manager = UserManager(db)
