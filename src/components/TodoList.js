import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all"); // 'all', 'completed', 'pending'
    const [dueDate, setDueDate] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        const response = await axios.get("http://localhost:5098/api/todo");
        setTodos(response.data);
    };

    const addTodo = async () => {
        if (newTodo.trim()) {
            await axios.post("http://localhost:5098/api/todo", {
                title: newTodo,
                isCompleted: false,
                dueDate
            });
            setNewTodo("");
            setDueDate(null);
            fetchTodos();
        }
    };

    const toggleComplete = async (id, isCompleted) => {
        await axios.put(`http://localhost:5098/api/todo/${id}`, { id, isCompleted: !isCompleted });
        fetchTodos();
    };

    const deleteTodo = async (id) => {
        await axios.delete(`http://localhost:5098/api/todo/${id}`);
        fetchTodos();
    };

    const startEditing = (id, title) => {
        setEditingId(id);
        setEditingTitle(title);
    };

    const editTodo = async () => {
        if (editingTitle.trim()) {
            await axios.put(`http://localhost:5098/api/todo/${editingId}`, {
                id: editingId,
                title: editingTitle
            });
            setEditingId(null);
            setEditingTitle("");
            fetchTodos();
        }
    };

    // Filtered and searched todos
    const filteredTodos = todos
        .filter(todo => {
            if (filter === 'completed') return todo.isCompleted;
            if (filter === 'pending') return !todo.isCompleted;
            return true;
        })
        .filter(todo => todo.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <h1>Todo List</h1>
            <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task"
            />
            <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                placeholderText="Select due date"
            />
            <button onClick={addTodo}>Add</button>

            <div>
                <input
                    type="text"
                    placeholder="Search tasks"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={() => setFilter('all')}>All</button>
                <button onClick={() => setFilter('completed')}>Completed</button>
                <button onClick={() => setFilter('pending')}>Pending</button>
            </div>

            <ul>
                {filteredTodos.map((todo) => (
                    <li key={todo.id}>
                        <input
                            type="checkbox"
                            checked={todo.isCompleted}
                            onChange={() => toggleComplete(todo.id, todo.isCompleted)}
                        />
                        {editingId === todo.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                />
                                <button onClick={editTodo}>Save</button>
                                <button onClick={() => setEditingId(null)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <span
                                    style={{
                                        textDecoration: todo.isCompleted ? "line-through" : "none",
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => toggleComplete(todo.id, todo.isCompleted)}
                                >
                                    {todo.title} {todo.dueDate && `(Due: ${new Date(todo.dueDate).toLocaleDateString()})`}
                                </span>
                                <button onClick={() => startEditing(todo.id, todo.title)}>Edit</button>
                                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoList;
