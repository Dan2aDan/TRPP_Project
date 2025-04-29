from sqlalchemy import DateTime, create_engine, Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from pydantic import BaseModel
from datetime import date, datetime

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

    # Связь с таблицей TeacherSolutions
    # teacher_solutions = relationship("TeacherSolutions", back_populates="teacher")


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
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    teacher_id: int = Column(Integer, ForeignKey('teachers.id'), nullable=False)
    file_id: int = Column(Integer, ForeignKey('files.id'), nullable=False)

    # Связи
    teacher = relationship("Teachers", back_populates="lessons")
    file = relationship("Files", back_populates="lessons")
    tasks = relationship("Tasks", back_populates="lesson")


class LessonsDepends(Base):
    __tablename__ = 'lessonsdepends'
    id: int = Column(Integer, primary_key=True)
    lesson_id: int = Column(Integer, ForeignKey('lessons.id'), nullable=False)
    student_id: int = Column(Integer, ForeignKey('students.id'), nullable=False)


class TeacherSolutions(Base):
    __tablename__ = 'teacher_solutions'
    id: int = Column(Integer, primary_key=True)
    text: str = Column(String, nullable=False)
    result: str = Column(String)
    state: int = Column(Integer, default=1)  # 1 - получено, 2 - проверка, 3 - правильно, 4 - неправильно
    created_at: datetime = Column(DateTime, default=datetime.utcnow)

    # Связи
    # teacher = relationship("Teachers", back_populates="teacher_solutions")
    task__ = relationship("Tasks", back_populates="teacher_solution")


class Tasks(Base):
    __tablename__ = 'tasks'
    id: int = Column(Integer, primary_key=True)
    lesson_id: int = Column(Integer, ForeignKey('lessons.id'), nullable=False)
    description: str = Column(String, nullable=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    test: str = Column(String, nullable=False)
    compl_solution_id: int = Column(Integer, ForeignKey('teacher_solutions.id'), nullable=True)

    # Связи
    lesson = relationship("Lessons", back_populates="tasks")
    teacher_solution = relationship("TeacherSolutions", back_populates="task__")
    student_solutions = relationship("StudentSolutions", back_populates="task")


class Students(Base):
    __tablename__ = 'students'
    id: int = Column(Integer, primary_key=True)
    login: str = Column(String(64), nullable=False)
    password_hash: str = Column(String(64), nullable=False)
    bio: str = Column(String, nullable=False)
    teacher_id: int = Column(Integer, ForeignKey('teachers.id'), nullable=False)

    # Связи
    teacher = relationship("Teachers", back_populates="students")
    student_solutions = relationship("StudentSolutions", back_populates="student")


class StudentSolutions(Base):
    __tablename__ = 'student_solutions'
    id: int = Column(Integer, primary_key=True)
    student_id: int = Column(Integer, ForeignKey('students.id'), nullable=False)
    task_id: int = Column(Integer, ForeignKey('tasks.id'), nullable=False)
    text: str = Column(String, nullable=False)
    result: str = Column(String)
    state: int = Column(Integer, default=1)  # 1 - получено, 2 - проверка, 3 - правильно, 4 - неправильно
    created_at: datetime = Column(DateTime, default=datetime.utcnow)

    # Связи
    student = relationship("Students", back_populates="student_solutions")
    task = relationship("Tasks", back_populates="student_solutions")
