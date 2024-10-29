import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  const API_URL = 'http://localhost:5098/api/todo';

  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch tasks from the API
  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Add a new task
  const addTodo = async () => {
    if (newTodo.trim()) {
      try {
        await axios.post(API_URL, { title: newTodo, isCompleted: false });
        setNewTodo(''); // Clear input field
        fetchTodos(); // Re-fetch tasks
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  // Toggle completion status
  const toggleComplete = async (id, isCompleted) => {
    try {
      await axios.put(`${API_URL}/${id}`, { id, isCompleted: !isCompleted });
      fetchTodos(); // Re-fetch tasks
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Delete a task
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTodos(); // Re-fetch tasks
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <div className="app">
      <h1>Todo List</h1>
      <div className="input-container">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="task-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.isCompleted ? 'completed' : ''}>
            <span
              onClick={() => toggleComplete(todo.id, todo.isCompleted)}
              style={{
                cursor: "pointer",
                textDecoration: todo.isCompleted ? "line-through" : "none",
              }}
            >
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
