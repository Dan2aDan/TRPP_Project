import sqlalchemy
from sqlalchemy import and_, delete
from DataBaseManager.__init__ import db
from DataBaseManager.models import TeacherSolutions, Tasks
import logging

class DbTeacherSolutions:
    def __init__(self, db):
        self.db = db

    def get_teacher_solution_by_id(self, solution_id):
        """Получить решение учителя по ID"""
        query = sqlalchemy.select(TeacherSolutions).where(TeacherSolutions.id == solution_id)
        return self.db.select(query, types=self.db.any_)
    
    def get_all_teacher_solutions(self, teacher_id):
        """Получить все решения учителей"""
        query = sqlalchemy.select(TeacherSolutions).where(TeacherSolutions.teacher_id == teacher_id)
        return self.db.select(query, types=self.db.all_)
    
    def get_teacher_lesson_solutions(self, teacher_id, lesson_id):
        """Получить все решения ученика по конкретному уроку"""
        query = sqlalchemy.select(TeacherSolutions).join(Tasks).where(
            and_(
                TeacherSolutions.teacher_id == teacher_id,
                Tasks.lesson_id == lesson_id
            )
        )
        return self.db.select(query, types=self.db.all_)
    
    def get_teacher_task_solutions(self, teacher_id, task_id):
        """Получить все решения ученика по конкретной задаче"""
        query = sqlalchemy.select(TeacherSolutions).where(
            and_(
                TeacherSolutions.teacher_id == teacher_id,
                TeacherSolutions.task_id == task_id
            )
        )
        return self.db.select(query, types=self.db.all_)

    def create_teacher_solution(self, teacher_id, task_id, text, result=None, state=1):
        """Создать решение учителя"""
        with self.db.create_session() as session:
            solution = TeacherSolutions(
                teacher_id=teacher_id,
                task_id=task_id,
                text=text,
                result=result,
                state=state,
                created_at=sqlalchemy.func.now()
            )
            session.add(solution)
            session.commit()
            session.refresh(solution)
            return solution

    def update_teacher_solution(self, solution_id, text=None, result=None, state=None):
        """Обновить решение учителя"""
        update_data = {}
        if text is not None:
            update_data['text'] = text
        if result is not None:
            update_data['result'] = result
        if state is not None:
            update_data['state'] = state

        if not update_data:
            return None

        with self.db.create_session() as session:
            solution = session.get(TeacherSolutions, solution_id)
            if solution:
                for key, value in update_data.items():
                    setattr(solution, key, value)
                session.commit()
                session.refresh(solution)
            return solution

    def delete_teacher_solution(self, solution_id):
        """Удалить решение учителя"""
        with self.db.create_session() as session:
            try:
                session.execute(delete(TeacherSolutions).where(TeacherSolutions.id == solution_id))
                session.commit()
                return True
            except Exception as e:
                session.rollback()
                logging.error(f"Error deleting teacher solution: {e}")
                return False


db_teacher_solutions = DbTeacherSolutions(db)