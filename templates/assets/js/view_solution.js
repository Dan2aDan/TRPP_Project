const params = new URLSearchParams(window.location.search);
const taskId = params.get('taskId');
const studentId = params.get('studentId');

let solutions = [];
let currentIndex = 0;
// const logoutBtn = document.getElementById('logout-btn');
// if (logoutBtn) {
//     logoutBtn.addEventListener('click', async () => {
//
//         try {
//             await fetch('/api/v0/auth/logout', {method: 'POST', credentials: 'include'});
//         } catch (e) {
//         }
//         window.location.href = 'login.html';
//
//     });
// }

async function loadSolutions() {
    try {
        // Получаем все решения по задаче и студенту
        const resp = await fetch(`/api/v0/solutions/student_solutions/task/${taskId}/${studentId}`);
        const data = await resp.json();
        solutions = data.result || [];
        if (solutions.length === 0) {
            showNoSolutions();
        } else {
            currentIndex = 0;
            showSolution(currentIndex);
        }
    } catch (e) {
        showNoSolutions();
    }
}

function showNoSolutions() {
    document.getElementById('solutionText').textContent = 'Нет решений';
    document.getElementById('solutionResult').textContent = '-';
    setStatus('failed');
    document.getElementById('prevSolution').disabled = true;
    document.getElementById('nextSolution').disabled = true;
}

function showSolution(index) {
    const solution = solutions[index];
    document.getElementById('solutionText').textContent = solution.text || '';
    document.getElementById('solutionResult').textContent = solution.result || '-';
    setStatus(getStatusClass(solution.state));
    document.getElementById('solutionTitle').textContent = `Решение задачи #${solution.task_id} (${index + 1} из ${solutions.length})`;

    document.getElementById('prevSolution').disabled = (index === 0);
    document.getElementById('nextSolution').disabled = (index === solutions.length - 1);
}

function setStatus(statusClass) {
    const el = document.getElementById('solutionStatus');
    el.className = 'solution-status ' + statusClass;
}

function getStatusClass(state) {
    // 3 — правильно, 2 — на проверке, 1 — в процессе, 4 — неверно, остальное — не начато
    switch (state) {
        case 3:
            return 'completed';
        case 2:
            return 'in-progress';
        case 1:
            return 'in-progress';
        case 4:
            return 'failed';
        default:
            return 'failed';
    }
}

document.getElementById('prevSolution').addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        showSolution(currentIndex);
    }
});
document.getElementById('nextSolution').addEventListener('click', () => {
    if (currentIndex < solutions.length - 1) {
        currentIndex++;
        showSolution(currentIndex);
    }
});

loadSolutions(); 