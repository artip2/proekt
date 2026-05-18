const STORAGE_KEY = "students_scores_by_subject";
function loadScores() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}
function saveScores(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// =========== UI Elements ==========
const teacherBtn = document.getElementById('teacherBtn');
const studentBtn = document.getElementById('studentBtn');
const teacherSection = document.getElementById('teacherSection');
const studentSection = document.getElementById('studentSection');
const subjectSelect = document.getElementById('subjectSelect');
const studentNameTeacher = document.getElementById('studentNameTeacher');
const scoreInput = document.getElementById('scoreInput');
const commentInput = document.getElementById('commentInput');
const addScoreBtn = document.getElementById('addScoreBtn');
const studentNameStudent = document.getElementById('studentNameStudent');
const viewScoresBtn = document.getElementById('viewScoresBtn');
const resultPanel = document.getElementById('resultPanel');
const subjectListResults = document.getElementById('subjectListResults');
const studentTools = document.getElementById('studentTools');
const selectSubjectToView = document.getElementById('selectSubjectToView');
const viewBySubjectBtn = document.getElementById('viewBySubjectBtn');
const downloadScoresBtn = document.getElementById('downloadScoresBtn');
// Учитель UI для управления оценками
const showStudentScoresBtn = document.getElementById('showStudentScoresBtn');
const manageScoresArea = document.getElementById('manageScoresArea');

// =========== Role Switch Logic ==========
teacherBtn.addEventListener('click', () => {
  teacherBtn.classList.add('active');
  studentBtn.classList.remove('active');
  teacherSection.classList.add("visible");
  studentSection.classList.remove("visible");
  resultPanel.style.display = 'none';
  studentTools && (studentTools.style.display = "none");
  manageScoresArea.style.display = "none";
});
studentBtn.addEventListener('click', () => {
  studentBtn.classList.add('active');
  teacherBtn.classList.remove('active');
  teacherSection.classList.remove("visible");
  studentSection.classList.add("visible");
  resultPanel.style.display = 'none';
  studentTools && (studentTools.style.display = "none");
  manageScoresArea.style.display = "none";
});

// =========== Teacher: Set Score ==========
addScoreBtn.addEventListener('click', () => {
  const subject = subjectSelect.value;
  const student = studentNameTeacher.value.trim();
  const scoreVal = scoreInput.value;
  const comment = commentInput.value.trim();

  if (!subject) {
    alert('Пожалуйста, выберите предмет.');
    return;
  }
  if (!student) {
    alert('Пожалуйста, введите имя студента.');
    return;
  }
  if (!scoreVal) {
    alert('Пожалуйста, выберите балл или отметку "Н".');
    return;
  }
  let scoreEntry;
  if (scoreVal === 'Н') {
    scoreEntry = {score: 'Н'};
  } else {
    const score = parseInt(scoreVal, 10);
    if (![2, 3, 4, 5].includes(score)) {
      alert('Допустимы только числа от 2 до 5 или отметка "Н".');
      return;
    }
    scoreEntry = {score, comment: comment || undefined};
  }

  const allData = loadScores();
  if (!allData[student]) allData[student] = {};
  if (!allData[student][subject]) allData[student][subject] = [];
  allData[student][subject].push(scoreEntry);
  saveScores(allData);

  alert(
    scoreEntry.score === 'Н'
      ? `Отметка "Н" добавлена студенту "${student}" по предмету "${subject}".`
      : `Балл ${scoreEntry.score} добавлен студенту "${student}" по предмету "${subject}"${scoreEntry.comment ? " с комментарием!" : "!"}`
  );
  scoreInput.value = '';
  commentInput.value = '';
});

// =========== Teacher: Manage Scores ==========

// Вспомогательная функция — показываем и даём редактировать/удалять оценки выбранного студента и предмета
function renderTeacherManageScores() {
  const student = studentNameTeacher.value.trim();
  const subject = subjectSelect.value;

  if (!student) {
    manageScoresArea.style.display = "block";
    manageScoresArea.innerHTML = `<span style="color:#ba2137;">Введите имя студента для управления оценками.</span>`;
    return;
  }
  if (!subject) {
    manageScoresArea.style.display = "block";
    manageScoresArea.innerHTML = `<span style="color:#ba2137;">Выберите предмет для управления оценками.</span>`;
    return;
  }

  const allData = loadScores();
  if (!allData[student] || !allData[student][subject] || allData[student][subject].length === 0) {
    manageScoresArea.style.display = "block";
    manageScoresArea.innerHTML = `<b>Нет оценок по предмету "${subject}" для "${student}".</b>`;
    return;
  }

  let html = `<b>Оценки "${student}" по предмету "${subject}":</b><ul class="scores-list" style="margin-top:7px;">`;
  allData[student][subject].forEach((s, idx) => {
    html += `<li>
      <span> 
        ${s.score === "Н" 
          ? `Отметка: <b>Н</b> <span style="color:#af396e">(Не был на занятии)</span>`
          : `Оценка: <b>${s.score}</b>${s.comment ? `<span class="score-comment">${s.comment}</span>` : ""}`
        } 
      </span>
      <button class="edit-score-btn" style="margin-left:7px;" data-idx="${idx}">✏️</button>
      <button class="delete-score-btn" style="color:#ba2137; margin-left:3px;" data-idx="${idx}">🗑</button>
    </li>`;
  });
  html += `</ul>`;

  html += `
    <button id="deleteAllScoresForStudentBtn" style="color:#ba2137; margin-top:10px;">Удалить все оценки по этому предмету</button>
    <div id="teacherDeleteConfirm" style="color:#ba2137;font-weight:700;display:none;margin-top:8px;background:#ffe5ea;border-radius:6px;padding:6px;">
      Нажмите ещё раз для подтверждения удаления!
    </div>`;

  manageScoresArea.innerHTML = html;
  manageScoresArea.style.display = "block";
}

showStudentScoresBtn.addEventListener('click', () => {
  renderTeacherManageScores();
});

// Делегирование событий для удаления/редактирования оценок
manageScoresArea.addEventListener("click", function(e) {
  const student = studentNameTeacher.value.trim();
  const subject = subjectSelect.value;
  if (!student || !subject) return;

  // Удалить одну оценку
  if (e.target.classList.contains("delete-score-btn")) {
    const idx = parseInt(e.target.getAttribute("data-idx"), 10);
    if (isNaN(idx)) return;

    const allData = loadScores();
    if (!allData[student] || !allData[student][subject]) return;
    if (!confirm("Удалить эту оценку?")) return;
    allData[student][subject].splice(idx,1);
    saveScores(allData);
    renderTeacherManageScores();
    return;
  }

  // Редактировать одну оценку
  if (e.target.classList.contains("edit-score-btn")) {
    const idx = parseInt(e.target.getAttribute("data-idx"), 10);
    if (isNaN(idx)) return;

    const allData = loadScores();
    const scores = allData[student][subject];
    if (!scores || !scores[idx]) return;

    const old = scores[idx];

    // Простое окно ввода нового балла и комментария (с валидацией)
    let val = prompt(
      'Введите новый балл (2-5 или "Н") и, при необходимости, комментарий (через ;), например: 4;Отлично сделал работу',
      old.score === "Н" 
        ? "Н"
        : old.comment ? `${old.score};${old.comment}` : `${old.score}`
    );
    if (val == null) return;
    val = val.trim();
    let scoreNew, commentNew;
    if (val.indexOf(";") !== -1) {
      scoreNew = val.split(";")[0].trim();
      commentNew = val.split(";").slice(1).join(";").trim();
    } else {
      scoreNew = val;
      commentNew = "";
    }
    let entry;
    if (scoreNew === "Н") {
      entry = {score: "Н"};
    } else {
      const snum = parseInt(scoreNew, 10);
      if (![2,3,4,5].includes(snum)) {
        alert('Допустимы только числа от 2 до 5 или "Н"');
        return;
      }
      entry = {score: snum};
      if (commentNew) entry.comment = commentNew;
    }

    // Обновляем
    scores[idx] = entry;
    saveScores(allData);
    renderTeacherManageScores();
    return;
  }

  // Удалить ВСЕ оценки у этого студента по предмету (двойное подтверждение)
  if (e.target.id === "deleteAllScoresForStudentBtn") {
    const allData = loadScores();
    let confirmDiv = document.getElementById("teacherDeleteConfirm");
    if (!confirmDiv) return;
    if (confirmDiv.style.display === "block") {
      // Второй клик — подтверждение
      if (allData[student] && allData[student][subject]) {
        allData[student][subject] = [];
        saveScores(allData);
        confirmDiv.style.display = "none";
        renderTeacherManageScores();
      }
    } else {
      // Первый клик — подсказка подтверждения
      confirmDiv.style.display = "block";
      setTimeout(()=>{ if(confirmDiv) confirmDiv.style.display = "none"; }, 3000);
    }
    return;
  }
});

// =========== Student: Больше функций ==========
function fillStudentSubjectsDropdown(student) {
  selectSubjectToView.innerHTML = '';
  const allData = loadScores();
  if (!allData[student]) {
    const opt = document.createElement('option');
    opt.textContent = "Нет предметов";
    opt.disabled = true;
    opt.selected = true;
    selectSubjectToView.appendChild(opt);
    return;
  }
  const subjects = Object.keys(allData[student]);
  if (subjects.length === 0) {
    const opt = document.createElement('option');
    opt.textContent = "Нет предметов";
    opt.disabled = true;
    opt.selected = true;
    selectSubjectToView.appendChild(opt);
    return;
  }
  subjects.forEach((subj, i) => {
    const opt = document.createElement('option');
    opt.value = subj;
    opt.textContent = subj;
    if (i === 0) opt.selected = true;
    selectSubjectToView.appendChild(opt);
  });
}

viewScoresBtn.addEventListener('click', () => {
  const student = studentNameStudent.value.trim();
  if (!student) {
    alert('Пожалуйста, введите своё имя.');
    resultPanel.style.display = 'none';
    studentTools.style.display = "none";
    return;
  }
  fillStudentSubjectsDropdown(student);
  studentTools.style.display = 'block';

  const allData = loadScores();
  const studentScores = allData[student];

  if (!studentScores) {
    subjectListResults.innerHTML = `<b>Нет данных об оценках для "${student}".</b>`;
    resultPanel.style.display = 'block';
    return;
  }

  let any = false;
  let html = '';
  for (const [subject, scores] of Object.entries(studentScores)) {
    if (scores.length) {
      any = true;
      let sum = 0;
      let count = 0;
      html += `<b>${subject}</b>:<br>`;
      html += `<ul class="scores-list">`;
      for (const s of scores) {
        if (s.score === 'Н') {
          html += `<li>Отметка: <b>Н</b> <span style="color:#af396e">(Не был на занятии)</span></li>`;
        } else {
          html += `<li>Оценка: <b>${s.score}</b>` +
                  (s.comment ? `<span class="score-comment">${s.comment}</span>` : '') +
                  `</li>`;
          sum += s.score;
          count++;
        }
      }
      html += `</ul>`;
      if (count > 0) {
        const avg = sum / count;
        html += `Средний балл: <b>${avg.toFixed(2)}</b> <hr class="separator"/>`;
      } else {
        html += `<span style="color:#c691ee;font-style:italic;">Только отметки "Н", средний балл не вычислен.</span><hr class="separator"/>`;
      }
    }
  }
  if (!any) {
    html = `<b>Нет оценок по вашим предметам.</b>`;
  }

  subjectListResults.innerHTML = html;
  resultPanel.style.display = 'block';
});

viewBySubjectBtn.addEventListener('click', () => {
  const student = studentNameStudent.value.trim();
  const subject = selectSubjectToView.value;
  if (!student) {
    alert('Пожалуйста, введите своё имя.');
    return;
  }
  if (!subject) {
    alert('Пожалуйста, выберите предмет.');
    return;
  }
  const allData = loadScores();
  const studentScores = allData[student];
  if (!studentScores || !studentScores[subject]) {
    subjectListResults.innerHTML = `<b>Нет оценок по предмету "${subject}" для "${student}".</b>`;
    resultPanel.style.display = 'block';
    return;
  }
  let html = `<b>${subject}</b>:<br>`;
  let sum = 0;
  let count = 0;
  html += `<ul class="scores-list">`;
  for (const s of studentScores[subject]) {
    if (s.score === 'Н') {
      html += `<li>Отметка: <b>Н</b> <span style="color:#af396e">(Не был на занятии)</span></li>`;
    } else {
      html += `<li>Оценка: <b>${s.score}</b>`;
      if (s.comment) html += `<span class="score-comment">${s.comment}</span>`;
      html += `</li>`;
      sum += s.score;
      count++;
    }
  }
  html += `</ul>`;
  if (count > 0) {
    html += `Средний балл: <b>${(sum/count).toFixed(2)}</b>`;
  } else {
    html += `<span style="color:#c691ee;font-style:italic;">Только отметки "Н", средний балл не вычислен.</span>`;
  }
  subjectListResults.innerHTML = html;
  resultPanel.style.display = 'block';
});

// Скачать оценки в формате JSON
downloadScoresBtn.addEventListener('click', () => {
  const student = studentNameStudent.value.trim();
  const allData = loadScores();
  const data = allData[student];
  if (!data) {
    alert('Нет данных для скачивания.');
    return;
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scores_${student}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
});