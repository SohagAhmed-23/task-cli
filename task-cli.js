#!/usr/bin/env node

/**
 * Task Tracker CLI
 * Features:
 *  - Add, update, delete tasks
 *  - Mark tasks as done or in-progress
 *  - List tasks (all, by status)
 *  - Data stored in tasks.json (auto-created)
 *
 * Usage examples:
 *   node task-cli.js add "Buy groceries"
 *   node task-cli.js update 1 "Buy groceries and cook dinner"
 *   node task-cli.js delete 1
 *   node task-cli.js mark-in-progress 1
 *   node task-cli.js mark-done 1
 *   node task-cli.js list
 *   node task-cli.js list done
 *   node task-cli.js list todo
 *   node task-cli.js list in-progress
 */

const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');

if(!fs.existsSync('tasks.json')) {
    fs.writeFileSync(path.join(__dirname, 'tasks.json'), '[]', 'utf-8');
}

const nextId = () => {
    const tasks = JSON.parse(fs.readFileSync(path.resolve(__dirname,'tasks.json'), 'utf-8'));
    if (tasks.length === 0) return 1;
    return Math.max(...tasks.map(t => t.id)) + 1;
}

const addTask = (description) => {
    if (!description) {
        console.log('Error: Task description cannot be empty.');
        return;
    }
    const data  = {
        id :  nextId(),
        description,
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
   
    const tasks = JSON.parse(fs.readFileSync(path.resolve(__dirname,'tasks.json'), 'utf-8'));
    tasks.push(data);
    fs.writeFileSync(path.resolve(__dirname,'tasks.json'), JSON.stringify(tasks, null, 2), 'utf-8');
  }


  const updateTask = (id, description) => {
    if (!description) {
        console.log('Error: Task description cannot be empty.');
        return;
    }
    const tasks = JSON.parse(fs.readFileSync(path.resolve(__dirname,'tasks.json'), 'utf-8'));
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
        console.log(`Error: Task with ID ${id} not found.`);
        return;
    }

    tasks[taskIndex].description = description;
    tasks[taskIndex].updatedAt = new Date().toISOString();
    fs.writeFileSync(path.resolve(__dirname,'tasks.json'), JSON.stringify(tasks, null, 2), 'utf-8');
    console.log(`Task with ID ${id} updated.`);
  }
    const deleteTask = (id) => {
    const tasks = JSON.parse(fs.readFileSync(path.resolve(__dirname,'tasks.json'), 'utf-8'));
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
        console.log(`Error: Task with ID ${id} not found.`);
        return;
    }
    tasks.splice(taskIndex, 1);
    fs.writeFileSync(path.resolve(__dirname,'tasks.json'), JSON.stringify(tasks, null, 2), 'utf-8');
    console.log(`Task with ID ${id} deleted.`);
    }


const markTask = (id, status) => {
    const validStatuses = ['todo', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
        console.log(`Error: Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
        return;
    }
    const task = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'tasks.json'), 'utf-8'));
    const taskIndex = task.findIndex(t => t.id === id);
    if (taskIndex === -1) {
        console.log(`Error: Task with ID ${id} not found.`);
        return;
    }
    task[taskIndex].status = status;
    task[taskIndex].updatedAt = new Date().toISOString();
    fs.writeFileSync(path.resolve(__dirname,'tasks.json'), JSON.stringify(task, null, 2), 'utf-8');
    console.log(`Task with ID ${id} marked as ${status}.`);

}
const listTasks = (filter) => {
    const validFilters = ['all', 'todo', 'in-progress', 'done'];
    if (filter && !validFilters.includes(filter)) {
        console.log(`Error: Invalid filter. Valid filters are: ${validFilters.join(', ')}`);
        return;
    }
    const tasks = JSON.parse(fs.readFileSync(path.resolve(__dirname,'tasks.json'), 'utf-8'));
    let filteredTasks = tasks;
    if (filter && filter !== 'all') {
        filteredTasks = tasks.filter(t => t.status === filter);
    }
    if (filteredTasks.length === 0) {
        console.log('No tasks found.');
        return;
    }
    filteredTasks.forEach(t => {
        console.log(`ID: ${t.id}, Description: ${t.description}, Status: ${t.status}, Created At: ${t.createdAt}, Updated At: ${t.updatedAt}`);
    });
}


const [ , , command , ...args] =  process.argv;

switch (command) {
    case 'add':
        addTask(args.join(' '));
        break;
    case 'update':
        updateTask(parseInt(args[0]), args.slice(1).join(' '));
        break;
    case 'delete':
        deleteTask(parseInt(args[0]));
        break;
    case 'mark-in-progress':
        markTask(parseInt(args[0]), 'in-progress');
        break;
    case 'mark-done':
        markTask(parseInt(args[0]), 'done');
        break;
    case 'list':
        listTasks(args[0]);
        break;
    default:
        console.log('Unknown command. Available commands: add, update, delete, mark-in-progress, mark-done, list');
}
