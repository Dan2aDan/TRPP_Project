import logging
from requests import Session
import sqlalchemy
from sqlalchemy import and_, delete, or_
from DataBaseManager.__init__ import db
from DataBaseManager.models import Students, Teachers, Lessons, Tasks, LessonsDepends, StudentSolutions, TeacherSolutions


class DatabaseLessons:
    def __init__(self, db):
        self.db = db

    def get_all_lessons(self):
        query = sqlalchemy.select(Lessons)
        return self.db.select(query, types=self.db.all_)


    def get_lesson_by_id(self, lesson_id):
        query = sqlalchemy.select(Lessons).where(Lessons.id == lesson_id)
        return self.db.select(query, types=self.db.any_)

    def get_students_from_lesson(self, lesson_id):
        query = sqlalchemy.select(LessonsDepends).where(LessonsDepends.lesson_id == lesson_id)
        return [node.student_id for node in self.db.select(query, types=self.db.all_)]

    def get_student_lessons(self, student_id):
        # Получаем teacher_id студента
        student = self.db.select(
            sqlalchemy.select(Students).where(Students.id == student_id),
            self.db.any_
        )

        if not student:
            return []

        query = sqlalchemy.select(Lessons).where(
            and_(
                Lessons.teacher_id == student.teacher_id,  # Уроки преподавателя
                Lessons.id.in_(
                    sqlalchemy.select(LessonsDepends.lesson_id)
                    .where(LessonsDepends.student_id == student_id)
                )  # Явно назначенные уроки
            )
        )
        return self.db.select(query, types=self.db.all_)

    def get_teacher_lessons(self, teacher_id):
        query = sqlalchemy.select(Lessons).where(Lessons.teacher_id == teacher_id)
        return self.db.select(query, types=self.db.all_)

    def add_lesson(self, title, content, teacher_id, file_id=None):
        with self.db.create_session() as session:
            # Создаем новый урок
            lesson = Lessons(
                title=title,
                content=content,
                teacher_id=teacher_id,
                file_id=file_id,
                created_at=sqlalchemy.func.now()
            )
            session.add(lesson)
            session.commit()
            session.refresh(lesson)  # Получаем ID
            return lesson

    def add_lesson_dependencies(self, lesson_id, student_ids):
        if not student_ids:
            return

        for student_id in student_ids:
            self.db.execute_commit(
                sqlalchemy.insert(LessonsDepends).values(
                    lesson_id=lesson_id,
                    student_id=student_id
                )
            )

    def update_lesson(self, lesson_id, title=None, content=None, file_id=None):
        update_data = {}
        if title is not None:
            update_data['title'] = title
        if content is not None:
            update_data['content'] = content
        if file_id is not None:
            update_data['file_id'] = file_id

        if not update_data:
            return None

        with self.db.create_session() as session:
            lesson = session.get(Lessons, lesson_id)
            if lesson:
                for key, value in update_data.items():
                    setattr(lesson, key, value)
                session.commit()
                session.refresh(lesson)
            session.close()
            return lesson

    def delete_lesson(self, lesson_id):
        with self.db.create_session() as session:
            try:
                # Удаляем решения и задачи
                tasks = session.execute(sqlalchemy.select(Tasks).where(Tasks.lesson_id == lesson_id)).scalars().all()
                for task in tasks:
                    # Удаляем решения учеников для задачи
                    session.execute(delete(StudentSolutions).where(StudentSolutions.task_id == task.id))
                    # Удаляем решения учителей для задачи
                    session.execute(delete(TeacherSolutions).where(TeacherSolutions.task_id == task.id))
                # Удаляем все задачи урока
                session.execute(delete(Tasks).where(Tasks.lesson_id == lesson_id))

                # Удаляем зависимости урока
                session.execute(delete(LessonsDepends).where(LessonsDepends.lesson_id == lesson_id))

                # Удаляем сам урок
                session.execute(delete(Lessons).where(Lessons.id == lesson_id))

                session.commit()
                return True
            except Exception as e:
                session.rollback()
                logging.error(f"Error deleting lesson: {e}")
                return False


db_lessons = DatabaseLessons(db)
