document.addEventListener('DOMContentLoaded', () => {
    displayProjects();
    displayToDoTasks();
});

// Retrieve users from local storage and get the active user
const users = JSON.parse(localStorage.getItem('users'));

if (users) {
    var activeUser = users.find(user => user.activeStatus === true);
    if (!activeUser) {
        alert('No user is signed in.');
        window.location.href = 'login_index.html';
    }
} else {
    alert('No user is signed in.');
    window.location.href = 'login_index.html';
}
function logOut() {
    if (activeUser) {
        activeUser.activeStatus = false; // Update the active status before logging out
    }
    localStorage.setItem('users', JSON.stringify(users));
    window.location.href = '../index.html';
}
// Function to open and close modals
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

let closer = document.getElementById('close');
if (closer != null) {
    closer.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('formModal');
        displayProjects();
        displayToDoTasks();
    });
}
// Add new project
let send = document.getElementById('send');
if (send != null) {
    send.addEventListener('click', (e) => {
        e.preventDefault();

        const projectName = document.getElementById('nameproject').value;
        const projectDescription = document.getElementById('projectinput').value;

        if (!projectName || !projectDescription) {
            alert("Please enter a project name and description.");
            return;
        }

        if (!activeUser) {
            alert("No user is signed in.");
            return;
        }

        if (!activeUser.projects) {
            activeUser.projects = [];
        }

        const project = {
            projectName: projectName,
            projectDescription: projectDescription,
            categories: {
                toDo: [],
                inProgress: [],
                complete: []
            }
        };

        activeUser.projects.push(project);
        localStorage.setItem("users", JSON.stringify(users));
        // projectCounter++;
        displayProjects();
        displayToDoTasks();
        closeModal('formModal');
    });

}

// Display projects
function displayProjects() {
    const projectContainer = document.getElementById('to_add_proj');
    if (projectContainer != null) {
        projectContainer.innerHTML = '';
    }

    if (activeUser && activeUser.projects) {
        activeUser.projects.forEach((project, index) => {
            // Ensure categories are initialized
            if (!project.categories) {
                project.categories = {
                    toDo: [],
                    inProgress: [],
                    complete: []
                };
            }

            const projectHTML = `
                <div class="card mb-3">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-table me-1"></i>
                            <div>${project.projectName}</div>
                        </div>
                        <div>
                            <div class="bg-danger btn btn-sm" onclick="removeProject(${index})">
                                <span class="text-light"> - Remove Project</span>
                            </div>
                            <button class="btn btn-info btn-sm" onclick="openEditFormModal(${index})">Edit</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <p>${project.projectDescription}</p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-primary" onclick="opentaskFormModal(${index}, 'toDo')">Add Task</button>
                        </div>
                        ${tasksHTML(project, index)}
                    </div>
                </div>
            `;
            if (projectContainer != null) {
                projectContainer.innerHTML += projectHTML;
            }
        });
    }
}

function tasksHTML(project, projectIndex) {
    return `
        <div id="p_cards" class="card-body">
            ${taskCategoryHTML('To Do', project.categories.toDo, projectIndex, 'toDo', 'bg-primary')}
            ${taskCategoryHTML('In Progress', project.categories.inProgress, projectIndex, 'inProgress', 'bg-warning')}
            ${taskCategoryHTML('Completed', project.categories.complete, projectIndex, 'complete', 'bg-success')}
        </div>
    `;
}

function taskCategoryHTML(categoryName, tasks, projectIndex, category, bgColorClass) {
    return `
        <div class="card" style="width: 18rem;">
            <div class="card-header d-flex justify-content-between">
                <span>${categoryName}</span>
                <i class="fa-solid fa-plus" style="color: #769fcd;" onclick="opentaskFormModal(${projectIndex}, '${category}')"></i>
            </div>
            <ul id="${category}Tasks${projectIndex}" class="list-group list-group-flush" ondrop="drop(event, '${category}', ${projectIndex})" ondragover="allowDrop(event)">
                ${tasks.map((task, taskIndex) => `
                    <div class="taskItem" draggable="true" ondragstart="drag(event, ${projectIndex}, '${category}', ${taskIndex})">
                        <li class="list-group-item card-header d-flex justify-content-between align-items-center ${bgColorClass} text-white">
                            ${task}
                            <div>
                                <i class="fa-solid fa-pen-to-square" onclick="openEditTaskFormModal(${projectIndex}, '${category}', ${taskIndex})"></i>
                                <i class="fa-solid fa-trash" onclick="removeTask(${projectIndex}, '${category}', ${taskIndex})"></i>
                            </div>
                        </li>
                    </div>
                `).join('')}
                <li class="list-group-item dropzone ${bgColorClass} text-white" ondrop="drop(event, '${category}', ${projectIndex})" ondragover="allowDrop(event)" style="min-height: 50px;"></li>
            </ul>
        </div>
    `;
}
let editSend = document.getElementById('editSend');
if (editSend != null) {
    editSend.addEventListener('click', (e) => {
        e.preventDefault();

        const projectName = document.getElementById('editProjectName').value;
        const projectDescription = document.getElementById('editProjectDescription').value;
        const projectIndex = document.getElementById('editSend').getAttribute('data-index');

        if (!activeUser) {
            alert("No user is signed in.");
            return;
        }

        activeUser.projects[projectIndex] = {
            ...activeUser.projects[projectIndex],
            projectName: projectName,
            projectDescription: projectDescription
        };

        localStorage.setItem('users', JSON.stringify(users));

        displayProjects();
        displayToDoTasks();
        closeModal('editFormModal');
    });

}
// add task
let addTaskButton = document.getElementById('addTaskButton');
if (addTaskButton != null) {
    addTaskButton.addEventListener('click', (e) => {
        e.preventDefault();

        const taskName = document.getElementById('taskName').value;
        const projectIndex = document.getElementById('addTaskButton').getAttribute('data-project-index');
        const category = document.getElementById('addTaskButton').getAttribute('data-category');
        if (taskName === '') {
            alert("Please enter a task name.");
            return;
        }
        if (!activeUser || !activeUser.projects || !activeUser.projects[projectIndex]) {
            alert("No user or projects found.");
            return;
        }

        const project = activeUser.projects[projectIndex];
        project.categories[category].push(taskName);
        // taskCounter++;
        localStorage.setItem('users', JSON.stringify(users));
        displayProjects();
        displayToDoTasks();
        closeModal('taskFormModal');
    });

}

// remove project
function removeProject(index) {
    if (activeUser && activeUser.projects) {
        activeUser.projects.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        // projectCounter--;
        displayProjects();
        displayToDoTasks();
    }
}

function openEditFormModal(index) {
    if (activeUser && activeUser.projects) {
        const project = activeUser.projects[index];
        document.getElementById('editProjectName').value = project.projectName;
        document.getElementById('editProjectDescription').value = project.projectDescription;
        document.getElementById('editSend').setAttribute('data-index', index);
    }
    openModal('editFormModal');
}

function opentaskFormModal(projectIndex, category) {
    document.getElementById('addTaskButton').setAttribute('data-project-index', projectIndex);
    document.getElementById('addTaskButton').setAttribute('data-category', category);
    openModal('taskFormModal');
}

function openEditTaskFormModal(projectIndex, category, taskIndex) {
    document.getElementById('editTaskButton').setAttribute('data-project-index', projectIndex);
    document.getElementById('editTaskButton').setAttribute('data-category', category);
    document.getElementById('editTaskButton').setAttribute('data-task-index', taskIndex);
    const taskName = activeUser.projects[projectIndex].categories[category][taskIndex];
    document.getElementById('editTaskName').value = taskName;
    openModal('editTaskFormModal');
}
let editTaskButton = document.getElementById('editTaskButton');
if (editTaskButton != null) {
    editTaskButton.addEventListener('click', (e) => {
        e.preventDefault();

        const taskName = document.getElementById('editTaskName').value;
        const projectIndex = document.getElementById('editTaskButton').getAttribute('data-project-index');
        const category = document.getElementById('editTaskButton').getAttribute('data-category');
        const taskIndex = document.getElementById('editTaskButton').getAttribute('data-task-index');

        if (!activeUser || !activeUser.projects || !activeUser.projects[projectIndex]) {
            alert("No user or projects found.");
            return;
        }

        activeUser.projects[projectIndex].categories[category][taskIndex] = taskName;
        localStorage.setItem('users', JSON.stringify(users));
        displayProjects();
        displayToDoTasks();
        closeModal('editTaskFormModal');
    });

}

function displayToDoTasks() {
    if (activeUser && activeUser.projects) {
        activeUser.projects.forEach((project, index) => {
            // Ensure categories are initialized
            if (!project.categories) {
                project.categories = {
                    toDo: [],
                    inProgress: [],
                    complete: []
                };
            }
            updateTaskList('toDo', project.categories.toDo, index, 'bg-primary');
            updateTaskList('inProgress', project.categories.inProgress, index, 'bg-warning');
            updateTaskList('complete', project.categories.complete, index, 'bg-success');
        });
    }
}

function updateTaskList(category, tasks, projectIndex, bgColorClass) {

    const tasksContainer = document.getElementById(`${category}Tasks${projectIndex}`);
    if (tasksContainer != null) {

        tasksContainer.innerHTML = tasks.map((task, taskIndex) => `
            <div class="taskItem" draggable="true" ondragstart="drag(event, ${projectIndex}, '${category}', ${taskIndex})">
                <li class="list-group-item card-header d-flex justify-content-between align-items-center ${bgColorClass} text-white">
                    ${task}
                    <div>
                        <i class="fa-solid fa-pen-to-square" onclick="openEditTaskFormModal(${projectIndex}, '${category}', ${taskIndex})"></i>
                        <i class="fa-solid fa-trash" onclick="removeTask(${projectIndex}, '${category}', ${taskIndex})"></i>
                    </div>
                </li>
            </div>
        `).join('') + `<li class="list-group-item dropzone ${bgColorClass} text-white" ondrop="drop(event, '${category}', ${projectIndex})" ondragover="allowDrop(event)" style="min-height: 50px;"></li>`;
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event, projectIndex, category, taskIndex) {
    event.dataTransfer.setData("text/plain", JSON.stringify({ projectIndex, category, taskIndex, taskName: activeUser.projects[projectIndex].categories[category][taskIndex] }));
}

function drop(event, targetCategory, projectIndex) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    const { projectIndex: sourceProjectIndex, category: sourceCategory, taskIndex, taskName } = data;

    // Ensure the task is valid before proceeding
    if (
        activeUser.projects[sourceProjectIndex] &&
        activeUser.projects[sourceProjectIndex].categories[sourceCategory] &&
        activeUser.projects[sourceProjectIndex].categories[sourceCategory][taskIndex] === taskName
    ) {
        // Remove task from source category
        activeUser.projects[sourceProjectIndex].categories[sourceCategory].splice(taskIndex, 1);

        // Add task to target category
        activeUser.projects[projectIndex].categories[targetCategory].push(taskName);

        localStorage.setItem('users', JSON.stringify(users));
        displayProjects();
        displayToDoTasks();
    }
}

function removeTask(projectIndex, category, taskIndex) {
    const project = activeUser.projects[projectIndex];
    project.categories[category].splice(taskIndex, 1);
    localStorage.setItem('users', JSON.stringify(users));

    displayProjects();
    displayToDoTasks();
}

function closeEditFormModal() {
    closeModal('editFormModal');
}

function closeFormModal() {
    closeModal('formModal');
}

function closetaskFormModal() {
    closeModal('taskFormModal');
}


