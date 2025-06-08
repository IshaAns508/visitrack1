let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (text !== "") {
    tasks.push({ text: text, completed: false });
    input.value = "";
    saveTasks();
    renderTasks();
  }
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  const filter = document.getElementById("filter").value;
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    const shouldShow =
      filter === "all" ||
      (filter === "active" && !task.completed) ||
      (filter === "completed" && task.completed);

    if (shouldShow) {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.textContent = task.text;
      if (task.completed) span.classList.add("completed");
      span.onclick = () => toggleTask(index);

      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.onclick = () => deleteTask(index);

      li.appendChild(span);
      li.appendChild(delBtn);
      list.appendChild(li);
    }
  });
}

// Initial render
renderTasks();
