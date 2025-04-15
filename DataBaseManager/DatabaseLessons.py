from requests import Session
import sqlalchemy
from sqlalchemy import and_, delete, or_
from DataBaseManager.__init__ import db
from DataBaseManager.models import Students, Teachers, Lessons, Tasks, Solutions, LessonsDepends


class DatabaseLessons:
    def __init__(self, db):
        self.db = db

    def get_lesson_by_id(self, lesson_id):
        query = sqlalchemy.select(Lessons).where(Lessons.id == lesson_id)
        return self.db.select(query, types=self.db.any_)

    def get_student_lessons(self, student_id):
        query = sqlalchemy.select(Lessons).join(Teachers).join(Students).where(
            or_(
                Students.id == student_id,  # Уроки преподавателя студента
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
        self.db.execute_commit(
            sqlalchemy.insert(Lessons).values(
                title=title,
                content=content,
                teacher_id=teacher_id,
                file_id=file_id,
                created_at=sqlalchemy.func.now()
            )
        )
        return self.db.select(
            sqlalchemy.select(Lessons).where(
                and_(
                    Lessons.title == title,
                    Lessons.teacher_id == teacher_id
                )
            ),
            self.db.any_
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
                # First delete related tasks and solutions
                tasks = session.execute(sqlalchemy.select(Tasks).where(Tasks.lesson_id == lesson_id)).scalars().all()
                for task in tasks:
                    session.execute(delete(Solutions).where(Solutions.task_id == task.id))
                session.execute(delete(Tasks).where(Tasks.lesson_id == lesson_id))
                
                # Then delete the lesson
                session.execute(delete(Lessons).where(Lessons.id == lesson_id))
                session.commit()
                return True
            except Exception as e:
                session.rollback()
                print(f"Error deleting lesson: {e}")
                return False
            finally:
                session.close()

    
    def add_task(self, lesson_id, description):
        self.db.execute_commit(
            sqlalchemy.insert(Tasks).values(
                lesson_id=lesson_id,
                description=description,
                created_at=sqlalchemy.func.now()
            )
        )
        return self.db.select(
            sqlalchemy.select(Tasks).where(
                and_(
                    Tasks.lesson_id == lesson_id,
                    Tasks.description == description
                )
            ),
            self.db.any_
        )


db_lessons = DatabaseLessons(db)