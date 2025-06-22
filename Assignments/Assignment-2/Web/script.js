
let tasks = [];
let token = "";

async function loginUser() {
  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@mail.com", password: "123456" }),
  });

  const data = await res.json();
  token = data.token;
  fetchTasks();
}

async function fetchTasks() {
  const res = await fetch("http://localhost:5000/api/todos", {
    headers: { Authorization: `Bearer ${token}` },
  });
  tasks = await res.json();
  renderTasks();
}

async function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (text !== "") {
    await fetch("http://localhost:5000/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: text, completed: false }),
    });
    input.value = "";
    fetchTasks();
  }
}

async function toggleTask(id, completed) {
  await fetch(`http://localhost:5000/api/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ completed: !completed }),
  });
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`http://localhost:5000/api/todos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  fetchTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  const filter = document.getElementById("filter").value;
  list.innerHTML = "";

  tasks.forEach((task) => {
    const shouldShow =
      filter === "all" ||
      (filter === "active" && !task.completed) ||
      (filter === "completed" && task.completed);

    if (shouldShow) {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.textContent = task.title;
      if (task.completed) span.classList.add("completed");
      span.onclick = () => toggleTask(task._id, task.completed);

      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.onclick = () => deleteTask(task._id);

      li.appendChild(span);
      li.appendChild(delBtn);
      list.appendChild(li);
    }
  });
}

loginUser();
