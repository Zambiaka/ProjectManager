document.addEventListener('DOMContentLoaded', function (event) {
    console.log('DOMContentLoaded');
    renderer.projectSection = document.getElementById('projectsSection');
    ajaxController.initalization
        .getData()
        .then(dataManager.saveData)
        .then(renderer.renderData)
        .then(eventManager.attachEvents);

    let addProjectButton = document.getElementById("addProject");
    addProjectButton.addEventListener('click', addProject);
});

function addProject() {
    let projectTemplate = renderer.createProject();
    eventManager.attachProjectTemplateEvents(projectTemplate);
}

let projects = [];

let dataManager = (function () {
    let exports = {
        saveData: function (data) {
            projects = data.map(JSON.parse);
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
            }
        }
    };

    return exports;
})();

let eventManager = (function () {

    function editName(element, id, onEnter) {
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
                    .then(function () {
                        let task = project.Tasks[project.Tasks.length - 1];
                        return task;
                    })
                    .then(renderer.renderTask);
                //TODO!!! 
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

        editName(task.element, task.Id, onEnter);

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


    let exports = {
        attachProjectEvents: function (project) {
            editProject(project);
            deleteProject(project);
            addTaskRow(project);
        },
        attachEvents: function (projects) {
            for (let i = 0; i < projects.length; i++) {
                eventManager.attachProjectEvents(projects[i]);
                eventManager.attachTaskEvents(projects[i]);
            }
        },
        attachProjectTemplateEvents: function (project) {
            projectTemplate(project);
        },
        attachTaskEvents: function (project) {
            for (let i = 0; i < project.Tasks.length; i++) {
                let task = project.Tasks[i]
                deleteTask(task);
                editTask(task);
                changeStatus(task);
            }
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
            let project =dataManager.getProject(task.ProjectId);
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
        }
    };
    return exports;
})();