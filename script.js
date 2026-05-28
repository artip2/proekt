// =========================
// script.js
// =========================

function findStudentKey(name){

  const target = name.trim().toLowerCase();

  for(const student in data){

    if(student.trim().toLowerCase() === target){

      return student;
    }
  }

  return null;
}
const STORAGE_KEY = "student_score_system";

const teacherBtn = document.getElementById("teacherBtn");
const studentBtn = document.getElementById("studentBtn");

const teacherSection = document.getElementById("teacherSection");
const studentSection = document.getElementById("studentSection");

const addBtn = document.getElementById("addBtn");
const viewBtn = document.getElementById("viewBtn");

const showManageBtn = document.getElementById("showManageBtn");

const manageArea = document.getElementById("manageArea");

const studentResults = document.getElementById("studentResults");

const toast = document.getElementById("toast");

const avgStat = document.getElementById("avgStat");
const countStat = document.getElementById("countStat");
const skipStat = document.getElementById("skipStat");

let data = loadData();

// =========================
// Theme
// =========================


const themeToggle = document.getElementById("themeToggle");

// Загружаем тему

if(localStorage.getItem("theme") === "light"){

  document.body.classList.add("light");

  themeToggle.innerText = "☀️";

}else{

  themeToggle.innerText = "🌙";
}

// Переключение темы

themeToggle.addEventListener("click", () => {

  document.body.classList.toggle("light");

  const isLight =
    document.body.classList.contains("light");

  if(isLight){

    localStorage.setItem("theme","light");

    themeToggle.innerText = "☀️";

  }else{

    localStorage.setItem("theme","dark");

    themeToggle.innerText = "🌙";
  }

});

// =========================
// Tabs
// =========================

teacherBtn.onclick = () => {

  teacherBtn.classList.add("active");
  studentBtn.classList.remove("active");

  teacherSection.classList.add("active-panel");
  studentSection.classList.remove("active-panel");

};

studentBtn.onclick = () => {

  studentBtn.classList.add("active");
  teacherBtn.classList.remove("active");

  studentSection.classList.add("active-panel");
  teacherSection.classList.remove("active-panel");

};

// =========================
// Storage
// =========================

function loadData(){

  const saved = localStorage.getItem(STORAGE_KEY);

  return saved ? JSON.parse(saved) : {};

}

function saveData(){

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

}

// =========================
// Toast
// =========================

function showToast(text){

  toast.className = "toast";
  toast.innerText = text;

  setTimeout(() => {
    toast.className = "";
  }, 2500);

}

// =========================
// Add Score
// =========================

addBtn.onclick = () => {

  const subject = document.getElementById("subject").value;
  const name = document.getElementById("teacherStudentName").value.trim();
  const score = document.getElementById("score").value;
  const comment = document.getElementById("comment").value.trim();

  if(!subject || !name || !score){

    showToast("Заполните все поля");

    return;
  }

  if(!data[name]){

    data[name] = {};
  }

  if(!data[name][subject]){

    data[name][subject] = [];
  }

  data[name][subject].push({
    id:Date.now(),
    score,
    comment
  });

  saveData();

  showToast("Оценка успешно добавлена");

};

// =========================
// View Scores
// =========================

viewBtn.onclick = () => {

  const inputName = document
    .getElementById("studentName")
    .value
    .trim();

  if(!inputName){

    showToast("Введите имя");

    return;
  }

  // =========================
  // Поиск без учёта регистра
  // =========================

  const realStudentName = findStudentKey(inputName);

  if(!realStudentName){

    studentResults.innerHTML = `
      <div class="card">
        Нет данных
      </div>
    `;

    return;
  }

  const student = data[realStudentName];

  let html = "";

  let total = 0;
  let count = 0;
  let skips = 0;

  for(const subject in student){

    html += `
      <div class="result-card">
        <h3>${subject}</h3>
    `;

    student[subject].forEach(item => {

      let scoreClass = `score-${item.score}`;

      if(item.score === "Н"){

        skips++;

        html += `
          <div class="score-item">
            <div>
              ❌ Не был
            </div>
          </div>
        `;

      }else{

        total += Number(item.score);
        count++;

        html += `
          <div class="score-item">
            <div class="${scoreClass}">
              Оценка: ${item.score}
            </div>

            <div>
              ${item.comment || ""}
            </div>
          </div>
        `;
      }

    });

    html += `</div>`;
  }

  const avg = count
    ? (total / count).toFixed(2)
    : "0.00";

  avgStat.innerText = avg;
  countStat.innerText = count;
  skipStat.innerText = skips;

  studentResults.innerHTML = html;

};

// =========================
// Manage Scores
// =========================

showManageBtn.onclick = () => {

  let html = "";

  for(const student in data){

    html += `
      <div class="result-card">

        <h3>${student}</h3>
    `;

    for(const subject in data[student]){

      html += `<b>${subject}</b>`;

      data[student][subject].forEach(item => {

        html += `
          <div class="manage-item">

            Оценка:
            <b>${item.score}</b>

            <br>

            Комментарий:
            ${item.comment || "—"}

            <div class="manage-buttons">

              <button 
                class="secondary-btn edit-btn"
                onclick="editScore('${student}','${subject}',${item.id})"
              >
                ✏️ Изменить
              </button>

              <button
                class="secondary-btn delete-btn"
                onclick="deleteScore('${student}','${subject}',${item.id})"
              >
                🗑 Удалить
              </button>

            </div>

          </div>
        `;
      });
    }

    html += `</div>`;
  }

  manageArea.innerHTML = html;

};

// =========================
// Delete Score
// =========================

function deleteScore(student,subject,id){

  data[student][subject] = data[student][subject]
  .filter(item => item.id !== id);

  saveData();

  showToast("Оценка удалена");

  showManageBtn.onclick();

}

// =========================
// Edit Score
// =========================

function editScore(student,subject,id){

  const item = data[student][subject]
  .find(x => x.id === id);

  if(!item) return;

  const newScore = prompt("Новая оценка", item.score);

  if(!newScore) return;

  item.score = newScore;

  saveData();

  showToast("Оценка изменена");

  showManageBtn.onclick();

}