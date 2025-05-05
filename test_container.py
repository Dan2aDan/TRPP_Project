import asyncio
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from DataBaseManager.models import TeacherSolutions, StudentSolutions, Tasks
from utils.autotest import AsyncCode, Runner
from utils.variable_environment import VarEnv


class TestContainer:
    def __init__(self, db_url):
        self.engine = create_engine(db_url)
        self.Session = sessionmaker(bind=self.engine)
        self.allowed_modules = {'time', 'random', 'math', 'functools'}

    async def check_teacher_solutions(self):
        session = self.Session()
        try:
            solutions = session.query(TeacherSolutions).filter(TeacherSolutions.state == 1).all()
            print(solutions)
            for solution in solutions:
                solution.state = 2
                session.commit()

                task = session.query(Tasks).filter(Tasks.compl_solution_id == solution.id).first()
                if not task:
                    continue
                try:
                    teacher_code = AsyncCode(solution.text, allowed_modules=self.allowed_modules)
                    runner = Runner(teacher_code, task.test)
                    result = await runner.run()
                    solution.state = 3 if result.success else 4
                    solution.result = result.output if result.success else result.error
                except Exception as e:
                    solution.state = 4
                    solution.result = str(e)
                session.commit()
        finally:
            session.close()

    async def check_student_solutions(self):
        session = self.Session()
        try:
            solutions = session.query(StudentSolutions).filter(StudentSolutions.state == 1).all()
            print(solutions)
            for solution in solutions:
                solution.state = 2
                session.commit()
                task = session.query(Tasks).filter(Tasks.id == solution.task_id).first()
                if not task or not task.compl_solution_id:
                    continue
                teacher_solution = session.query(TeacherSolutions).filter(
                    TeacherSolutions.id == task.compl_solution_id
                ).first()
                if not teacher_solution:
                    continue
                try:
                    student_code = AsyncCode(solution.text, allowed_modules=self.allowed_modules)
                    teacher_code = AsyncCode(teacher_solution.text, allowed_modules=self.allowed_modules)
                    # Получаем эталонный вывод учителя
                    teacher_runner = Runner(teacher_code, task.test)
                    teacher_result = await teacher_runner.run()
                    # Получаем вывод студента
                    student_runner = Runner(student_code, task.test)
                    student_result = await student_runner.run()
                    # Сравниваем
                    if teacher_result.success and student_result.success and \
                            teacher_result.output.strip() == student_result.output.strip():
                        solution.state = 3
                        solution.result = student_result.output
                    else:
                        solution.state = 4
                        solution.result = f"Ожидалось: {teacher_result.output}, Получено: {student_result.output}"
                except Exception as e:
                    solution.state = 4
                    solution.result = str(e)
                session.commit()
        finally:
            session.close()

    async def run(self):
        print("Проверка")
        while True:
            await self.check_teacher_solutions()
            await self.check_student_solutions()
            await asyncio.sleep(10)
            print("Проверка")

if __name__ == "__main__":
    db_url = f'postgresql+psycopg2://{VarEnv.DBUSER}:{VarEnv.DBPASSWORD}@{VarEnv.DBHOST}/{VarEnv.DBNAME}'
    asyncio.run(TestContainer(db_url).run())
