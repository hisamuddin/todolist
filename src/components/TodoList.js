import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        const response = await axios.get("http://localhost:5098/api/todo");
        setTodos(response.data);
    };

    const addTodo = async () => {
        if (newTodo.trim()) {
            await axios.post("http://localhost:5098/api/todo", { title: newTodo, isCompleted: false });
            setNewTodo("");
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

    return (
        <div>
            <h1>Todo List</h1>
            <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task"
            />
            <button onClick={addTodo}>Add</button>

            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        <span
                            style={{
                                textDecoration: todo.isCompleted ? "line-through" : "none",
                            }}
                            onClick={() => toggleComplete(todo.id, todo.isCompleted)}
                        >
                            {todo.title}
                        </span>
                        <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoList;
