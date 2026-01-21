'use strict';
// { name: タスクの名前, isDone: 完了しているかどうかの真偽値 }
const tasks = [];

/**
 * タスクを追加する
 * @param {string} taskName
 */
function add(taskName) {
  tasks.push({ name: taskName, isDone: false });
}

/**
 * タスク名と完了したかどうかの真偽値が含まれるオブジェクトを受け取り、完了したかを返す
 * @param {object} task
 * @return {boolean} 完了したかどうか
 */
function isDone(task) {
  return task.isDone;
}

/**
 * タスク名と完了したかどうかの真偽値が含まれるオブジェクトを受け取り、完了していないかを返す
 * @param {object} task
 * @return {boolean} 完了していないかどうか
 */
function isNotDone(task) {
  return !isDone(task);
}

/**
 * タスクの一覧の配列を取得する
 * @returns {string[]}
 */
function list() {
  return tasks
    .filter(isNotDone)
    .map(task => task.name);
}
/**
 * タスクを完了状態にする
 * @param {string} taskName
 */
function done(taskName) {
  const indexFound = tasks.findIndex(task => task.name === taskName);
  if (indexFound !== -1) {
    tasks[indexFound].isDone = true;
  }
}

/**
 * 完了済みのタスクの一覧の配列を取得する
 * @returns {string[]}
 */
function donelist() {
  return tasks
    .filter(isDone)
    .map(task => task.name);
}

/**
 * 項目を削除する
 * @param {string} taskName
 */
function del(taskName) {
  const indexFound = tasks.findIndex(task => task.name === taskName);
  if (indexFound !== -1) {
    tasks.splice(indexFound, 1);
  }
}

// ===== ここから web 用の処理 =====

// HTML要素を取得
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const doneList = document.getElementById("doneList");

// 追加ボタンが押されたとき
addBtn.addEventListener("click", () => {
  const taskName = taskInput.value.trim();
  if (taskName === "") return;

  add(taskName);
  taskInput.value = "";
  renderTaskList();
});

//タスクリストを画面に描画する関数
function renderTaskList() {
  taskList.innerHTML = "";
  const taskNames = list();
  taskNames.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;

    const btnGroup = document.createElement("div");
    btnGroup.classList.add("taskButtons");


    //完了ボタンを作る
    const doneBtn = document.createElement("button");
    doneBtn.classList.add("done-btn");
    doneBtn.textContent = "✓";

    //クリックされたら done(name) する
    doneBtn.addEventListener("click", () => {
      done(name);
      renderTaskList();
    });

    //削除ボタンを作る
    const delBtn = document.createElement("button");
    delBtn.classList.add("del-btn");
    delBtn.textContent = "✕";

    //クリックされたら del(name) する
    delBtn.addEventListener("click", () => {
      del(name);
      renderTaskList();
    });

    btnGroup.appendChild(doneBtn);
    btnGroup.appendChild(delBtn);
    li.appendChild(btnGroup);
    taskList.appendChild(li);
  });

  //完了済みタスクリストを描画
  doneList.innerHTML = "";
  const doneTaskNames = donelist();
  doneTaskNames.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    doneList.appendChild(li);

    //削除ボタンを作る
    const delBtn = document.createElement("button");
    delBtn.classList.add("del-btn");
    delBtn.textContent = "✕";

    //クリックされたら del(name) する
    delBtn.addEventListener("click", () => {
      del(name);
      renderTaskList();
    });

    li.appendChild(delBtn);
    doneList.appendChild(li);
  })

  renderTaskSelect();
}

//タスクの選択
const taskSelect = document.getElementById("taskSelect");
const currentTaskNameEl = document.getElementById("currentTaskName");
let selectedTaskName = null;

//未完了のタスクをselectに流し込む関数
function renderTaskSelect() {
  taskSelect.innerHTML = "";
  const taskNames = list();

  if (selectedTaskName !== null && !taskNames.includes(selectedTaskName)) {
    selectedTaskName = null;
    currentTaskNameEl.textContent = "未選択"
  }

  //先頭に「未選択」用 option を入れる
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "未選択";
  taskSelect.appendChild(defaultOption);

  taskNames.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    taskSelect.appendChild(option);
  });

  //すでに選択中のタスクがあればそれをselectに反映
  if (selectedTaskName !== null) {
    taskSelect.value = selectedTaskName;
  }
}

//プルダウンが変わったときの処理を書く
taskSelect.addEventListener("change", () => {
  const selectedValue = taskSelect.value;
  if (selectedValue === "") {
    selectedTaskName = null;
    currentTaskNameEl.textContent = "未選択";
  } else {
    selectedTaskName = selectedValue;
    currentTaskNameEl.textContent = selectedTaskName;
  }
});


//タイマー
const workTime = 1500;
const breakTime = 300;
let mode = "work";
let remainingTime = workTime;
let isRunning = false;
let intervalId;


//表示更新の関数
function updateDisplay() {
  let 分 = Math.floor(remainingTime / 60);
  let 秒 = remainingTime % 60;
  if (分 < 10) {
    分 = "0" + 分;
  }
  if (秒 < 10) {
    秒 = "0" + 秒;
  }
  const timeDisplay = document.getElementById("timeDisplay");
  timeDisplay.textContent = `${分}:${秒}`;

  const timerTaskName = document.getElementById("timerTaskName");
  if (selectedTaskName === null) {
    timerTaskName.textContent = "";
  } else {
    timerTaskName.textContent = `${selectedTaskName}`;
  }

  const modeDisplay = document.getElementById("modeDisplay");
  if (mode === "work") {
    modeDisplay.textContent = "作業モード";
  } else {
    modeDisplay.textContent = "休憩モード";
  }
}

//一秒ごとの処理
function tick() {
  remainingTime = remainingTime - 1;
  if (remainingTime === 0) {
    clearInterval(intervalId)
    isRunning = false;
    if (mode === "work") {
      mode = "break";
      remainingTime = breakTime;
    } else {
      mode = "work";
      remainingTime = workTime;
    }
    updateDisplay();
  } else {
    updateDisplay();
  }
}

//スタートボタンを押したら、、
const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", () => {
  if (isRunning === true) {
    return;
  } else {
    isRunning = true;
    intervalId = setInterval(tick, 1000);
  }
});

//ストップボタンを押したら、、
const stopBtn = document.getElementById("stopBtn");
stopBtn.addEventListener("click", () => {
  if (isRunning === false) {
    return;
  } else {
    isRunning = false;
    clearInterval(intervalId);
  }
});

//リセットボタンを押したら、、
const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", () => {
  isRunning = false;
  clearInterval(intervalId);
  mode = "work";
  remainingTime = workTime;
  updateDisplay();
});

