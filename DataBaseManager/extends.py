from ctypes.wintypes import HTASK

import sqlalchemy
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from DataBaseManager.DatabaseTeachers import DatabaseTeachers
from DataBaseManager.UserManager import UserManager
from DataBaseManager.models import Base, Students, Teachers, Lessons, Tasks, LessonsDepends, Files, TeacherSolutions, StudentSolutions
from DataBaseManager.__init__ import db
from DataBaseManager.DatabaseLessons import DatabaseLessons
from DataBaseManager.DatabaseStudents import DatabaseStudents
from DataBaseManager.DatabaseTasks import DatabaseTasks
from DataBaseManager.DbTeacherSolutions import DbTeacherSolutions
from DataBaseManager.DbStudentSolutions import DbStudentSolutions
from utils.utils import singleton


@singleton
class DBALL(DatabaseTeachers, DatabaseStudents, DatabaseLessons, DatabaseTasks,
            UserManager, DbTeacherSolutions, DbStudentSolutions):
    def __init__(self, db_=db):
        self.db = db
        super().__init__(db_)

    def get_obj_unique(self, cls, **kwargs):
        return self.db.select(sqlalchemy.select(cls).filter_by(**kwargs), types=self.db.any_)

    def clear_all_data(self):
        from sqlalchemy import text

        with self.db.create_session() as conn:
            conn.execute(text("""
                              TRUNCATE TABLE
                                  student_solutions,
                    teacher_solutions,
                    tasks,
                    lessonsdepends,
                    lessons,
                    students,
                    files,
                    teachers
                RESTART IDENTITY CASCADE
                              """))
            conn.commit()

    def create_data(self):
        pass
        teacher1 = self.register_teacher("teacher1", "password1", "Коваленко Кирилл")
        teacher2 = self.register_teacher("teacher2", "password2", "Абубакаров Турпал")
        student1 = self.register_student("student1", "password1", teacher1.id)
        student2 = self.register_student("student2", "password2", teacher1.id)
        lesson1 = self.add_lesson("lesson1", "content lesson 1", teacher1.id, None)
        lesson2 = self.add_lesson("lesson2", "content lesson 2", teacher1.id, None)
        task1 = self.add_task(lesson1.id,"task1", "content task 1")
        teacher_solution = self.create_teacher_solution(teacher1.id, task1.id, "teacher solution 1")
        self.update_task(task1.id, solution=teacher_solution.id)

