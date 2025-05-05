import sqlalchemy
from sqlalchemy import and_, delete
from DataBaseManager.__init__ import db
from DataBaseManager.models import StudentSolutions, Tasks
import logging
from datetime import datetime, timezone


class DbStudentSolutions:
    def __init__(self, db):
        self.db = db

    def get_student_solution_by_id(self, solution_id):
        """Получить решение ученика по ID"""
        query = sqlalchemy.select(StudentSolutions).where(StudentSolutions.id == solution_id)
        return self.db.select(query, types=self.db.any_)

    def get_all_student_solutions(self, student_id):
        """Получить все решения ученика"""
        query = sqlalchemy.select(StudentSolutions).where(
            StudentSolutions.student_id == student_id
        )
        return self.db.select(query, types=self.db.all_)

    def get_student_lesson_solutions(self, student_id, lesson_id, states=[]):
        """Получить все решения ученика по конкретному уроку"""
        query = sqlalchemy.select(StudentSolutions).join(Tasks).where(
            and_(
                StudentSolutions.student_id == student_id,
                Tasks.lesson_id == lesson_id,
                StudentSolutions.state.in_(states)
            )
        )
        return self.db.select(query, types=self.db.all_)

    def get_student_task_solutions(self, student_id, task_id, states=[]):
        """Получить все решения ученика по конкретной задаче"""
        query = sqlalchemy.select(StudentSolutions).where(
            and_(
                StudentSolutions.student_id == student_id,
                StudentSolutions.task_id == task_id,
                StudentSolutions.state.in_(states)

            )
        )
        return self.db.select(query, types=self.db.all_)

    def get_student_solutions_by_states(self, student_id, states):
        """Получить решения ученика с указанными статусами"""
        if not states:
            return []

        query = sqlalchemy.select(StudentSolutions).where(
            and_(
                StudentSolutions.student_id == student_id,
                StudentSolutions.state.in_(states)
            )
        )
        return self.db.select(query, types=self.db.all_)

    def create_student_solution(self, student_id, task_id, text, result=None, state=1):
        """Создать решение ученика"""
        with self.db.create_session() as session:
            solution = StudentSolutions(
                student_id=student_id,
                task_id=task_id,
                text=text,
                result=result,
                state=state
            )
            session.add(solution)
            session.commit()
            session.refresh(solution)
            return solution

    def update_student_solution(self, solution_id, text=None, result=None, state=None):
        """Обновить решение ученика"""
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
            solution = session.get(StudentSolutions, solution_id)
            if solution:
                for key, value in update_data.items():
                    setattr(solution, key, value)
                session.commit()
                session.refresh(solution)
            return solution

    def delete_student_solution(self, solution_id):
        """Удалить решение ученика"""
        with self.db.create_session() as session:
            try:
                session.execute(delete(StudentSolutions).where(StudentSolutions.id == solution_id))
                session.commit()
                return True
            except Exception as e:
                session.rollback()
                logging.error(f"Error deleting student solution: {e}")
                return False


db_student_solutions = DbStudentSolutions(db)
