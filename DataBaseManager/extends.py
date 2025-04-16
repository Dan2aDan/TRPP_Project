import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from DataBaseManager.DatabaseTeachers import DatabaseTeachers
from DataBaseManager.UserManager import UserManager
from DataBaseManager.models import Base, Students, Teachers, Lessons, Tasks, Solutions, LessonsDepends, Files
from DataBaseManager.__init__ import db
from DataBaseManager.DatabaseLessons import DatabaseLessons
from DataBaseManager.DatabaseStudents import DatabaseStudents
from utils.utils import singleton


@singleton
class DBALL(DatabaseTeachers, DatabaseStudents, DatabaseLessons, UserManager):
    def __init__(self, db_=db):
        super().__init__(db_)

    def get_obj_unique(self, cls, **kwargs):
        return db.select(sqlalchemy.select(cls).filter_by(**kwargs), types=db.any_)

    def clear_all_data(self):
        with db.create_session() as conn:
            conn.execute(Files.__table__.delete())
            conn.execute(Tasks.__table__.delete())
            conn.execute(LessonsDepends.__table__.delete())
            conn.execute(Lessons.__table__.delete())
            conn.execute(Students.__table__.delete())
            conn.execute(Solutions.__table__.delete())

            conn.execute(Teachers.__table__.delete())
            conn.commit()

    def create_data(self):
        pass
        teacher1 = self.register_teacher("teacher1", "password1")
        teacher2 = self.register_teacher("teacher2", "password2")
        student1 = self.register_student("student1", "password1", teacher1.id)
        student2 = self.register_student("student2", "password2", teacher1.id)
        lesson1 = self.add_lesson("lesson1", "content lesson 1", teacher1.id, None)
        lesson2 = self.add_lesson("lesson2", "content lesson 2", teacher1.id, None)
