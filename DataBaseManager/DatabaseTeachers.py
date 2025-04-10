from requests import Session
import sqlalchemy
from sqlalchemy import and_, delete
from DataBaseManager.__init__ import db
from DataBaseManager.models import Students, Teachers, Lessons, Tasks, Solutions


class DatabaseTeachers:
    def __init__(self, db):
        self.db = db

    def get_teacher_students(self, teacher_id):
        query = sqlalchemy.select(Students).where(Students.teacher_id == teacher_id)
        return self.db.select(query, types=db.all_)
    
    def register_teacher(self, login, password):
        self.db.execute_commit(sqlalchemy.insert(Teachers).values(login=login, password_hash=password, bio=""))
        return self.db.select(sqlalchemy.select(Teachers).where(Teachers.login == login), self.db.any_)


db_teachers = DatabaseTeachers(db)