function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const newTodoInput = document.getElementById("newTodo");
const addBtn = document.getElementById("addBtn");
const searchInput = document.getElementById("search");
const todoListDiv = document.getElementById("todoList");
const counter = document.getElementById("counter");
const filterBtns = document.querySelectorAll(".filter-btn");

let filter = "all";

// --- LocalStorage ---
function getTodos() {
  try {
    return JSON.parse(localStorage.getItem("todos")) || [];
  } catch {
    return [];
  }
}
function saveTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// --- Render ---
function renderTodos() {
  const todos = getTodos();
  let filtered = todos;

  if (filter === "active") filtered = todos.filter(t => !t.completed);
  if (filter === "completed") filtered = todos.filter(t => t.completed);

  const query = searchInput.value.toLowerCase();
  filtered = filtered.filter(t => t.text.toLowerCase().includes(query));

  if (filtered.length === 0) {
    todoListDiv.innerHTML = "No todos found";
    counter.textContent = "";
    return;
  }

  todoListDiv.innerHTML = "";
  filtered.forEach(todo => {
    const div = document.createElement("div");
    div.className = "todo-item";
    div.innerHTML = `
      <input type="checkbox" data-id="${todo.id}" ${todo.completed ? "checked" : ""}>
      <span style="text-decoration:${todo.completed ? "line-through" : "none"}">${todo.text}</span>
      <button class="delete-btn" data-id="${todo.id}">Delete</button>
    `;
    todoListDiv.appendChild(div);
  });

  counter.textContent = `Total: ${todos.length}, Completed: ${todos.filter(t => t.completed).length}`;
}

// --- Add Todo ---
addBtn.addEventListener("click", () => {
  const text = newTodoInput.value.trim();
  if (!text) return;

  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  const todos = getTodos();
  todos.push(newTodo);
  saveTodos(todos);
  renderTodos();
  newTodoInput.value = "";
});

// --- Event Delegation ---
todoListDiv.addEventListener("click", (e) => {
  const todos = getTodos();
  if (e.target.type === "checkbox") {
    const id = Number(e.target.dataset.id);
    const todo = todos.find(t => t.id === id);
    todo.completed = e.target.checked;
    saveTodos(todos);
    renderTodos();
  }

  if (e.target.classList.contains("delete-btn")) {
    const id = Number(e.target.dataset.id);
    const updated = todos.filter(t => t.id !== id);
    saveTodos(updated);
    renderTodos();
  }
});

// --- Filters ---
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    renderTodos();
  });
});

// --- Debounced Search ---
searchInput.addEventListener("input", debounce(renderTodos, 400));

// Initial render
renderTodos();
