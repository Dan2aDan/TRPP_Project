from sqlalchemy import create_engine, Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from pydantic import BaseModel
from datetime import date

Base = declarative_base()


class Users(Base):
    __tablename__ = 'users'
    id: int = Column(Integer, primary_key=True)
    login: str = Column(String)
    password: str = Column(String)
