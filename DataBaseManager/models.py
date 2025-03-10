from sqlalchemy import create_engine, Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from pydantic import BaseModel
from datetime import date

Base = declarative_base()


class Teachers(Base):
    __tablename__ = 'teachers'
    id: int = Column(Integer, primary_key=True)
    login: str = Column(String(64), nullable=False)
    password_hash: str = Column(String(64), nullable=False)
    bio: str = Column(String, nullable=False)

    # Связь с таблицей Lessons
    lessons = relationship("Lessons", back_populates="teacher")

    # Связь с таблицей Students
    students = relationship("Students", back_populates="teacher")


class Files(Base):
    __tablename__ = 'files'
    id: int = Column(Integer, primary_key=True)
    path: str = Column(String(255), nullable=False)
    url: str = Column(String(255), nullable=False)
    uploaded_at: date = Column(Date)

    # Связь с таблицей Lessons
    lessons = relationship("Lessons", back_populates="file")


class Lessons(Base):
    __tablename__ = 'lessons'
    id: int = Column(Integer, primary_key=True)
    title: str = Column(String(64), nullable=False)
    content: str = Column(String, nullable=False)
    created_at: date = Column(Date)
    teacher_id: int = Column(Integer, ForeignKey('teachers.id'), nullable=False)
    file_id: int = Column(Integer, ForeignKey('files.id'), nullable=False)

    # Связи
    teacher = relationship("Teachers", back_populates="lessons")
    file = relationship("Files", back_populates="lessons")
    tasks = relationship("Tasks", back_populates="lesson")


class Tasks(Base):
    __tablename__ = 'tasks'
    id: int = Column(Integer, primary_key=True)
    lesson_id: int = Column(Integer, ForeignKey('lessons.id'), nullable=False)
    description: str = Column(String, nullable=False)
    created_at: date = Column(Date)

    # Связи
    lesson = relationship("Lessons", back_populates="tasks")
    solutions = relationship("Solutions", back_populates="task")


class Students(Base):
    __tablename__ = 'students'
    id: int = Column(Integer, primary_key=True)
    login: str = Column(String(64), nullable=False)
    password_hash: str = Column(String(64), nullable=False)
    bio: str = Column(String, nullable=False)
    teacher_id: int = Column(Integer, ForeignKey('teachers.id'), nullable=False)

    # Связи
    teacher = relationship("Teachers", back_populates="students")
    solutions = relationship("Solutions", back_populates="student")


class Solutions(Base):
    __tablename__ = 'solutions'
    id: int = Column(Integer, primary_key=True)
    task_id: int = Column(Integer, ForeignKey('tasks.id'), nullable=False)
    student_id: int = Column(Integer, ForeignKey('students.id'), nullable=False)
    solution_text: str = Column(String, nullable=False)
    submitted_at: date = Column(Date)

    # Связи
    task = relationship("Tasks", back_populates="solutions")
    student = relationship("Students", back_populates="solutions")
