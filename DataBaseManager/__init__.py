from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from pydantic import BaseModel
from utils.variable_environment import VarEnv
from DataBaseManager.models import *


class DataBaseManager:
    all_ = 0
    any_ = 1

    def __init__(self,
                 db_url=f'postgresql+psycopg2://{VarEnv.DBUSER}:{VarEnv.DBPASSWORD}@{VarEnv.DBHOST}/{VarEnv.DBNAME}'):
        """
        Инициализация подключения к БД:
        - db_url: строка подключения (например, 'sqlite:///mydatabase.db')
        """

        self.engine = create_engine(db_url, echo=True)

    def execute_commit(self, command):
        with self.engine.connect() as session:
            session.execute(command)
            session.commit()
            session.close()

    def select(self, command, types=all_):
        with self.engine.connect() as session:
            if types == self.all_:
                data = session.execute(command).fetchall()
            else:
                data = session.execute(command).fetchone()
            session.close()
            return data


class UserManager:
    def __init__(self, db):
        self.db = db

    def register_student(self, login, password):
        self.db.execute_commit(sqlalchemy.insert(Students).values(login=login, password=password))
        return self.db.select(sqlalchemy.select(Students).where(Students.login == login), self.db.any_)

    def register_teacher(self, login, password):
        self.db.execute_commit(sqlalchemy.insert(Teachers).values(login=login, password=password))
        return self.db.select(sqlalchemy.select(Teachers).where(Teachers.login == login), self.db.any_)
    
    def is_user(self, login, password):
        query = sqlalchemy.select(Users).where(and_(Users.login == login, Users.password == password))
        return self.db.select(query, types=self.db.any_)

db = DataBaseManager()
user_manager = UserManager(db)
