import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from DataBaseManager.DatabaseTeachers import DatabaseTeachers
from DataBaseManager.UserManager import UserManager
from DataBaseManager.models import Base, Students, Teachers, Lessons
from DataBaseManager.__init__ import db
from DataBaseManager.DatabaseLessons import DatabaseLessons
from DataBaseManager.DatabaseStudents import DatabaseStudents
from utils.utils import singleton


@singleton
class DBALL(DatabaseTeachers, DatabaseStudents, DatabaseLessons, UserManager):
    def get_obj_unique(self, cls, **kwargs):
        return db.select(sqlalchemy.select(cls).where(**kwargs), types=db.any_)
