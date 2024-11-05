import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isToday } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'pending'
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const API_URL = 'http://localhost:5098/api/todo';

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    const notifyDueTasks = () => {
      todos.forEach(todo => {
        const dueDate = new Date(todo.dueDate);
        if (isToday(dueDate) && !todo.isCompleted) {
          new Notification(`Task Due Today: ${todo.title}`);
        }
      });
    };

    // Request notification permission
    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          const intervalId = setInterval(notifyDueTasks, 600000); // Check every minute
          return () => clearInterval(intervalId);
        }
      });
    }
  }, [todos]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL);
      const todosWithCorrectedDates = response.data.map(todo => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : null // Convert to Date object
      }));
      setTodos(todosWithCorrectedDates);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      try {
        const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : null; // Use UTC time
        await axios.post(API_URL, { title: newTodo, isCompleted: false, dueDate: formattedDueDate });
        setNewTodo('');
        setDueDate(null); // Reset dueDate after adding
        fetchTodos(); // Refresh the todo list
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  const toggleComplete = async (id, title, isCompleted, dueDate) => {
    if (isCompleted) {
      await markAsCompleted(id, title, dueDate); // Pass dueDate when completing the task
    } else {
      try {
        await axios.put(`${API_URL}/${id}`, { id, title, isCompleted: !isCompleted, dueDate: dueDate });
        fetchTodos();
      } catch (error) {
        console.error("Error updating todo:", error);
      }
    }
  };

  const markAsCompleted = async (id, title, dueDate) => {
    try {
      await axios.put(`${API_URL}/${id}`, { id, title, isCompleted: true, dueDate: dueDate });
      fetchTodos();
    } catch (error) {
      console.error("Error marking todo as completed:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const startEditing = (id, title, dueDate) => {
    setEditingId(id);
    setEditingTitle(title);
    setDueDate(new Date(dueDate)); // Set the dueDate to the existing due date
  };

  const editTodo = async () => {
    if (editingTitle.trim()) {
      try {
        const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : null; // Format the date
        await axios.put(`${API_URL}/${editingId}`, {
          id: editingId,
          title: editingTitle,
          dueDate: formattedDueDate // Send formatted date to API
        });
        setEditingId(null);
        setEditingTitle('');
        setDueDate(null); // Reset dueDate after editing
        fetchTodos();
      } catch (error) {
        console.error("Error editing todo:", error);
      }
    }
  };

  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'completed') return todo.isCompleted;
      if (filter === 'pending') return !todo.isCompleted;
      return true;
    })
    .filter(todo => todo.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const groupTodosByDate = (todos) => {
    const grouped = {};
    todos.forEach(todo => {
      const date = format(new Date(todo.dueDate), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(todo);
    });

    // Sort the keys (dates) in ascending order
    const sortedKeys = Object.keys(grouped).sort();

    // Create a new sorted object
    const sortedGrouped = {};
    sortedKeys.forEach(key => {
      sortedGrouped[key] = grouped[key];
    });

    return sortedGrouped;
  };

  const groupedTodos = groupTodosByDate(filteredTodos);

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Todo List</h1>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task"
        />
        <div className="input-group-append">
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            placeholderText="Due date"
            className="form-control"
          />
          <button onClick={addTodo} className="btn btn-primary ml-2">Add</button>
        </div>
      </div>

      <div className="mb-3 d-flex justify-content-between">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search tasks"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div>
          <button className="btn btn-secondary mx-1" onClick={() => setFilter('all')}>All</button>
          <button className="btn btn-success mx-1" onClick={() => setFilter('completed')}>Completed</button>
          <button className="btn btn-warning mx-1" onClick={() => setFilter('pending')}>Pending</button>
        </div>
      </div>

      {/* Use Bootstrap grid to limit card width */}
      <div className="row">
        {Object.keys(groupedTodos).map(date => (
          <div className="col-md-6 col-lg-4 mb-3" key={date}> {/* Adjust the column size here */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h5>
              </div>
              <ul className="list-group list-group-flush">
                {groupedTodos[date].map(todo => (
                  <li
                    key={todo.id}
                    className={`list-group-item d-flex justify-content-between align-items-center ${todo.isCompleted ? 'bg-light text-muted' : ''}`}
                    style={{
                      border: todo.isCompleted ? '2px solid #28a745' : '2px solid #ffc107',
                      borderRadius: '8px',
                      padding: '15px'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <input
                        type="checkbox"
                        checked={todo.isCompleted}
                        onChange={() => toggleComplete(todo.id, todo.title, todo.isCompleted, todo.dueDate)} // Pass dueDate here
                        className="mr-3"
                      />
                      {editingId === todo.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                        />
                      ) : (
                        <span
                          onClick={() => toggleComplete(todo.id, todo.title, todo.isCompleted)}
                          style={{ cursor: 'pointer', textDecoration: todo.isCompleted ? 'line-through' : 'none' }}
                        >
                          {todo.title} {todo.dueDate && `(Due: ${new Date(todo.dueDate).toLocaleDateString()})`}
                        </span>
                      )}
                    </div>
                    <div>
                      {!todo.isCompleted && (
                        <button onClick={() => markAsCompleted(todo.id, todo.title, todo.dueDate)} className="btn btn-sm btn-outline-success mr-2">
                          Mark as Completed
                        </button>
                      )}
                      {editingId === todo.id ? (
                        <>
                          <DatePicker
                            selected={dueDate}
                            onChange={(date) => setDueDate(date)} // Ensure dueDate is updated
                            className="form-control"
                          />
                          <button onClick={editTodo} className="btn btn-sm btn-primary mr-2">Save</button>
                          <button onClick={() => setEditingId(null)} className="btn btn-sm btn-secondary">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => startEditing(todo.id, todo.title, todo.dueDate)} className="btn btn-sm btn-info mr-2">Edit</button>
                      )}
                      <button onClick={() => deleteTodo(todo.id)} className="btn btn-sm btn-danger">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
