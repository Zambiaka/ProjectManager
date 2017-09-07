document.addEventListener('DOMContentLoaded', function (event) {
    console.log('DOMContentLoaded');
    usersController.loginMode.on();
    eventManager.attachLoginFormEvents();


    //renderer.projectSection = document.getElementById('projectsSection');
    //ajaxController.initalization
    //    .getData()
    //    .then(dataManager.saveData)
    //    .then(renderer.renderData)
    //    .then(eventManager.attachEvents);

    //let addProjectButton = document.getElementById("addProject");
    //addProjectButton.addEventListener('click', addProject);
});

function addProject() {
    let projectTemplate = renderer.createProject();
    eventManager.attachProjectTemplateEvents(projectTemplate);
}

//let statuses = new WeakMap([
//    "loginSuccessful": "You are logged in.",
//    "notFound": "Login or password is invalid",
//    "alreadyExists": "Login already exists",
//    "registrationSuccessful": "Account created"
//    ]
//);

let projects = [];

let usersController = (function () {
    let exports = {
        loginMode: {
            on: function () {
                let loginForm = document.getElementById("loginForm");
                let content = document.getElementById("content");
                renderer.element.show(loginForm);
                renderer.element.hide(content);
            },
            off: function () {
                let loginForm = document.getElementById("loginForm");
                let content = document.getElementById("content");
                renderer.element.show(content);
                renderer.element.hide(loginForm);
            }
        },
        registerMode: {
            on: function () {
                let loginButtons = document.querySelector('.loginButtons');
                let registerButtons = document.querySelector('.registerButtons');
                let userNameInput = document.getElementById("name");
                renderer.element.show(registerButtons);
                renderer.element.hide(loginButtons);
                renderer.element.show(userNameInput);

            },
            off: function () {
                let loginButtons = document.querySelector('.loginButtons');
                let registerButtons = document.querySelector('.registerButtons');
                let userNameInput = document.getElementById("name");
                renderer.element.hide(registerButtons);
                renderer.element.show(loginButtons);
                renderer.element.hide(userNameInput);
            }
        }
    }
    return exports;
})();

let dataManager = (function () {
    function swipeTasksPriority(task, action) {

        let condition;
        if (action.increase) {
            condition = function (taskInProject) {
                return taskInProject.Priority < task.Priority;
            }
        } else {
            condition = function (taskInProject) {
                return taskInProject.Priority > task.Priority;
            }
        }

        let project = dataManager.getProject(task.ProjectId);
        let taskWithHigherPriority = project.Tasks
            .filter(function (taskInProject) { return condition(taskInProject); })
            .sort()[0];
        if (taskWithHigherPriority) {
            let taskPriority = task.Priority;
            task.Priority = taskWithHigherPriority.Priority;
            taskWithHigherPriority.Priority = taskPriority;
            sortTasksByPriority(project);
        }
    }

    function sortTasksByPriority(project) {
        project.Tasks.sort(function (task1, task2) {
            return task1.Priority - task2.Priority;
        });
    }

    let exports = {
        saveData: function (data) {
            projects = data.map(JSON.parse);
            for (let i = 0; i < projects.length; i++) {
                sortTasksByPriority(projects[i]);
            }
            return projects;
        },
        saveProject: function (data) {
            projects.push(JSON.parse(data));
        },
        getProject: function (id) {
            return projects.filter(function (project) { return project.Id == id })[0];
        },
        removeProjectFromCollection: function (project) {
            let index = projects.indexOf(project);
            projects.splice(index, 1);
        },
        removeTaskFromCollection: function (taskToRemove) {
            for (let i = 0; i < projects.length; i++) {
                if (projects[i].Tasks.length) {
                    let index = projects[i].Tasks.indexOf(taskToRemove);
                    if (index != -1) {
                        projects[i].Tasks.splice(index, 1);
                    }
                }
            }
        },
        saveTaskToCollection: function (data) {
            let task = JSON.parse(data);
            let project = dataManager.getProject(task.ProjectId);
            project.Tasks.push(task);
            return task;
        },
        task: {
            priority: {
                increase: function (task) {
                    return swipeTasksPriority(task, { increase: {} });
                },
                decrease: function (task) {
                    return swipeTasksPriority(task, { decrease: {} });
                }
            },
            getIndex: function (task) {
                let project = dataManager.getProject(task.ProjectId);
                return project.Tasks.indexOf(task);
            }
        }
    };
    return exports;
})();

let ajaxController = (function () {
    //TODO Implement error handling
    function showError() {
        console.log('error in ajax');
    }

    function ajaxPost(url, data) {
        return new Promise(function (resolve) {
            $.ajax({
                type: "POST",
                url: url,
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: resolve,
                error: showError
            });
        });
    }

    let exports = {
        user: {
            login: function (login, password) {
                let url = "/Users/Login";
                return ajaxPost(url, [login, password]);
            },
            register: function (login, password, name) {
                let url = "/Users/Registration";
                return ajaxPost(url, [login, password, name]);
            }
        },
        initalization: {
            getData: function () {
                let userId = [1]
                let url = "/Projects/GetProjects";
                return ajaxPost(url, userId);
            }
        },
        project: {
            remove: function (projectId) {
                let url = "/Projects/Delete";
                return ajaxPost(url, [projectId]);
            },
            add: function (projectName, userId) {
                let url = "/Projects/Add";
                return ajaxPost(url, [projectName, userId]);
            },
            edit: function (projectId, newName) {
                let url = "/Projects/Edit";
                return ajaxPost(url, [projectId, newName]);
            },
        },
        task: {
            changeStatus: function (newStatus, taskId) {
                let url = "/Tasks/ChangeStatus";
                return ajaxPost(url, [newStatus, taskId]);
            },
            remove: function (taskId) {
                let url = "/Tasks/Delete";
                return ajaxPost(url, [taskId]);
            },
            edit: function (taskId, newName) {
                let url = "/Tasks/Edit";
                return ajaxPost(url, [taskId, newName]);
            },
            add: function (projectId, taskName) {
                let url = "/Tasks/Add";
                return ajaxPost(url, [projectId, taskName]);
            },
            priority: {
                increase: function (taskId) {
                    let url = "/Tasks/IncreasePriority";
                    return ajaxPost(url, [taskId]);
                },
                decrease: function (taskId) {
                    let url = "/Tasks/DecreasePriority";
                    return ajaxPost(url, [taskId])
                }
            }
        }
    };

    return exports;
})();

let eventManager = (function () {

    //Login events

    function clearInputs(){
        let loginInput = document.getElementById('login');
        let passwordInput = document.getElementById('password');
        let nameInput = document.getElementById('name');

        loginInput.value = passwordInput.value = nameInput.value = '';
    }

    function loginEvents() {
        let loginBtn = document.getElementById('loginBtn');
        loginBtn.addEventListener('click', function () {
            let loginInput = document.getElementById('login');
            let passwordInput = document.getElementById('password');
            if (!loginInput.value || !passwordInput.value) {
                renderer.showNotification("Login or password fields can't be empty");
                return;
            }
            ajaxController.user.login(loginInput.value, passwordInput.value).then(function (data) {
                renderer.showNotification(data, "success");
                clearInputs();
            });
        });

        let registerBtn = document.getElementById('registrBtn');
        registerBtn.addEventListener('click', function () {
            usersController.registerMode.on();
        });

        let submitRegistr = document.getElementById('submit');
        submitRegistr.addEventListener('click', function () {
            let loginInput = document.getElementById('login');
            let passwordInput = document.getElementById('password');
            let nameInput = document.getElementById('name');

            if (!loginInput.value || !passwordInput.value || !nameInput.value) {
                renderer.showNotification("Fields can't be empty");
                return;
            }
            ajaxController.user.register(loginInput.value, passwordInput.value, nameInput.value).then(function (data) {
                renderer.showNotification(data, "success");
                clearInputs();
            });
        });

        let cancelBtn = document.getElementById('cancel');
        cancelBtn.addEventListener('click', function () {
            usersController.registerMode.off();
            clearInputs();
        });
    }

    function _editName(element, id, onEnter) {
        let input = element.querySelector('input');
        $(input).off();
        let oldName = input.value;
        $(input).on('keydown', function (e) {
            const enterKey = 13;
            const escKey = 27;
            if (e.keyCode === enterKey) {
                renderer.nameEditMode.disable(element);
                if (input.value !== oldName) {
                    onEnter(id, input.value);
                }
            } else if (e.keyCode === escKey) {
                input.value = oldName;
                renderer.nameEditMode.disable(element);
            }
        });
    }

    //Project events
    function editProject(project) {
        function onEnter(projectId, newName) {
            ajaxController.project.edit(projectId, newName);
        }

        editName(project.element, project.Id, onEnter);

        let editProjectBtn = project.element.querySelector('.editProjectBtn');
        editProjectBtn.addEventListener('click', function () {
            renderer.nameEditMode.enable(project.element)
        });
    }

    //Add task row events (attach it with project events, because this row is placed in project template Index.cshtml
    function addTaskRow(project) {
        let addTaskBtn = project.element.querySelector('.addTaskBtn');
        let newTaskName = project.element.querySelector('.newTaskName');
        addTaskBtn.addEventListener('click', function () {
            if (newTaskName.value) {
                //TODO Validation here
                ajaxController.task.add(project.Id, newTaskName.value)
                    .then(dataManager.saveTaskToCollection)
                    .then(renderer.renderTask)
                    .then(function () {
                        let task = project.Tasks[project.Tasks.length - 1];
                        eventManager.attachTaskEvents(task);
                    })
                newTaskName.value = "";
            }
        });
    }

    //TODO refactor this
    function projectTemplate(projectTemplate) {
        let input = projectTemplate.element.querySelector('.projectName');
        let oldProjectName = input.value;
        $(input).on('keydown', function (e) {
            const enterKey = 13;
            const escKey = 27;
            if (e.keyCode === enterKey) {
                renderer.nameEditMode.disable(projectTemplate.element);
                //TODO
                let userId = 1;
                ajaxController.project.add(input.value, userId)
                    .then(dataManager.saveProject)
                    .then(
                    function () {
                        //save element from template
                        projects[projects.length - 1].element = projectTemplate.element;
                        //attach project events
                        eventManager.attachProjectEvents(projects[projects.length - 1]);
                    });

            } else if (e.keyCode === escKey) {
                renderer.removeElFromPage(projectTemplate.element);
            }
        });
    }

    function deleteProject(project) {
        let deleteProjectBtn = project.element.querySelector('.deleteProjectBtn');
        deleteProjectBtn.addEventListener('click', function (event) {
            ajaxController.project.remove(project.Id);
            renderer.removeElFromPage(project.element);

            dataManager.removeProjectFromCollection();

            event.preventDefault();
            event.stopImmediatePropagation();
        });
    }

    //Task events

    function deleteTask(task) {
        let deleteTaskBtn = task.element.querySelector('.deleteTaskBtn');
        deleteTaskBtn.addEventListener('click', function (event) {
            ajaxController.task.remove(task.Id);
            renderer.removeElFromPage(task.element);
            dataManager.removeTaskFromCollection(task);
            event.preventDefault();
            event.stopImmediatePropagation();
        });
    }

    function editTask(task) {
        function onEnter(taskId, newName) {
            ajaxController.task.edit(taskId, newName);
        }

        _editName(task.element, task.Id, onEnter);

        let editTaskBtn = task.element.querySelector('.editTaskBtn');
        editTaskBtn.addEventListener('click', function () {
            renderer.nameEditMode.enable(task.element)
        });
    }

    function changeStatus(task) {
        let statusCheckBox = task.element.querySelector('.taskStatus');
        statusCheckBox.addEventListener('change', function () {
            task.Status = statusCheckBox.checked;
            ajaxController.task.changeStatus(task.Status, task.Id);
        });
    }

    function changePriority(task) {
        let priorityUpBtn = task.element.querySelector('.priorityUp');
        priorityUpBtn.addEventListener('click', function (event) {
            let taskIndex = dataManager.task.getIndex(task);
            if (taskIndex) {
                ajaxController.task.priority.increase(task.Id);
                renderer.moveEl.up(task);
                dataManager.task.priority.increase(task);
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        });

        let priorityDownBtn = task.element.querySelector('.priorityDown');
        priorityDownBtn.addEventListener('click', function (event) {
            let lastTaskIndex = dataManager.getProject(task.ProjectId).Tasks.length - 1;
            let taskIndex = dataManager.task.getIndex(task);
            if (taskIndex < lastTaskIndex) {
                ajaxController.task.priority.decrease(task.Id);
                renderer.moveEl.down(task);
                dataManager.task.priority.decrease(task);
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        });
    }

    let exports = {
        attachLoginFormEvents: loginEvents,
        attachProjectEvents: function (project) {
            editProject(project);
            deleteProject(project);
            addTaskRow(project);
        },
        attachEvents: function (projects) {
            for (let i = 0; i < projects.length; i++) {
                eventManager.attachProjectEvents(projects[i]);
                eventManager.attachTasksEvents(projects[i]);
            }
        },
        attachProjectTemplateEvents: function (project) {
            projectTemplate(project);
        },
        attachTasksEvents: function (project) {
            for (let i = 0; i < project.Tasks.length; i++) {
                let task = project.Tasks[i]
                eventManager.attachTaskEvents(task);
            }
        },
        attachTaskEvents: function (task) {
            deleteTask(task);
            editTask(task);
            changeStatus(task);
            changePriority(task);
        }
    };
    return exports;
})();

let renderer = (function () {
    function getTaskDOM() {
        let template = document.querySelector('#taskTemplate');
        return template.content;
    }

    function getProjectDOM() {
        let template = document.querySelector('#projectTemplate');
        return template.content;
    }

    function renderTasksInProject(project) {
        for (let i = 0; i < project.Tasks.length; i++) {
            renderer.renderTask(project.Tasks[i]);
        }
    }

    function insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    let exports = {
        projectSection: null,
        renderData: function (projects) {
            for (let i = 0; i < projects.length; i++) {
                renderer.renderProject(projects[i]);
                renderTasksInProject(projects[i]);
            }
            return projects;
        },
        renderProject: function (project) {
            let content = getProjectDOM();
            //TODO refactor this

            let projectName = content.querySelector('.projectName');
            projectName.value = project.Name;
            document.importNode(content);
            renderer.projectSection.appendChild(content.cloneNode(true));

            project.element = renderer.projectSection.children[renderer.projectSection.children.length - 1];
            return project;
        },
        renderTask: function (task) {
            let project = dataManager.getProject(task.ProjectId);
            let tasksContainer = project.element.querySelector('.taskList');
            if (!tasksContainer) {
                //Create ul for the tsks if project doesn't have any tasks yet
                tasksContainer = document.createElement('ul');
                tasksContainer.classList.add('taskList');
            }
            let content = getTaskDOM();
            let taskNameRow = content.querySelector('.taskName');
            taskNameRow.value = task.Name;
            document.importNode(content);

            tasksContainer.appendChild(content.cloneNode(true));
            project.element.appendChild(tasksContainer);
            let tasks = project.element.querySelectorAll('.task');

            task.element = tasks[tasks.length - 1];
            return task;
        },
        createProject: function () {
            //TODO create increment New TODO List(1), then New TODO List(2)
            //TODO input style width, on focus 
            let project = renderer.renderProject({ Name: "New TODO List" });
            renderer.nameEditMode.enable(project.element);
            return project;
        },
        nameEditMode: {
            enable: function (element) {
                let input = element.querySelector('input[type="text"]');
                input.disabled = false;
                input.focus();
                $(input).select();
            },
            disable: function (element) {
                let input = element.querySelector('input[type="text"]');
                input.selectionEnd = input.selectionStart;
                input.disabled = true;
            }
        },
        removeElFromPage: function (el) {
            el.remove();
        },
        moveEl: {
            up: function (task) {
                let taskIndex = dataManager.task.getIndex(task);
                let project = dataManager.getProject(task.ProjectId);
                let prev = project.Tasks[taskIndex - 1];
                let parent = task.element.parentNode;
                parent.insertBefore(task.element, prev.element);
            },
            down: function (task) {
                let taskIndex = dataManager.task.getIndex(task);
                let project = dataManager.getProject(task.ProjectId);
                let next = project.Tasks[taskIndex + 1];

                insertAfter(next.element, task.element);
            }
        },
        element: {
            show: function (element) {
                element.style.display = "block";
            },
            hide: function (element) {
                element.style.display = "none";
            }
        },
        showNotification: function (message, alertType) {
            let alert = document.querySelector('.alert');
            let messageContainer = document.getElementById('alertText');
            messageContainer.innerText = message;
            if (alertType==='success') {
                alert.classList.remove('alert-danger');
                alert.classList.add('alert-success');
            } else {
                alert.classList.remove('alert-success');
                alert.classList.add('alert-danger');
            }
            renderer.element.show(alert);
            setTimeout(function () { renderer.element.hide(alert); }, 2000);
        }
    };
    return exports;
})();