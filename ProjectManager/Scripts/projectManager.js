document.addEventListener('DOMContentLoaded', function (event) {
    console.log('DOMContentLoaded');
    renderer.projectSection = document.getElementById('projectsSection');
    ajaxController
        .getInitalizeData()
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
        getInitalizeData: function () {
            let userId = [1]
            let url = "/Projects/GetProjects";
            return ajaxPost(url, userId);
        },
        addProject: function (projectName, userId) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: "/Projects/AddProject",
                    data: JSON.stringify([projectName, userId]),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: resolve,
                    error: reject
                });
            });
        },
        deleteProject: function (projectId) {
            let url = "/Projects/DeleteProject";
            return ajaxPost(url, [projectId]);
        },
        editProject: function (projectId, newName) {
            let url = "/Projects/EditProject";
            return ajaxPost(url, [projectId, newName]);
        },
        deleteTask: function (taskId) {
            let url = "/Tasks/DeleteTask";
            return ajaxPost(url, [taskId]);
        },
        editTask: function (taskId, newName) {
            let url = "/Tasks/EditTask";
            return ajaxPost(url, [taskId, newName]);
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
                renderer.disableEditMode(element);
                if (input.value !== oldName) {
                    onEnter(id, input.value);
                }
            } else if (e.keyCode === escKey) {
                input.value = oldName;
                renderer.disableEditMode(element);
            }
        });
    }


    //Project events
    function editProject(project) {
        function onEnter(projectId, newName) {
            ajaxController.editProject(projectId, newName);
        }

        editName(project.element, project.Id, onEnter);

        let editProjectBtn = project.element.querySelector('.editProjectBtn');
        editProjectBtn.addEventListener('click', function () { renderer.enableEditMode(project.element) });
    }

    //TODO refactor this
    function projectTemplate(projectTemplate) {
        let input = projectTemplate.element.querySelector('.projectName');
        let oldProjectName = input.value;
        $(input).on('keydown', function (e) {
            const enterKey = 13;
            const escKey = 27;
            if (e.keyCode === enterKey) {
                renderer.disableEditMode(projectTemplate.element);
                //TODO
                let userId = 1;
                ajaxController.addProject(input.value, userId).then(dataManager.saveProject);
                //save element from template
                projects[projects.length - 1].element = projectTemplate.element;

                eventManager.attachProjectEvents(projectTemplate);
            } else if (e.keyCode === escKey) {
                renderer.removeElFromPage(projectTemplate.element);
            }
        });
    }

    function deleteProject(project) {
        let deleteProjectBtn = project.element.querySelector('.deleteProjectBtn');
        deleteProjectBtn.addEventListener('click', function (event) {
            ajaxController.deleteProject(project.Id);
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
            ajaxController.deleteTask(task.Id);
            renderer.removeElFromPage(task.element);
            dataManager.removeTaskFromCollection(task);
            event.preventDefault();
            event.stopImmediatePropagation();
        });
    }

    function editTask(task) {
        function onEnter(taskId, newName) {
            ajaxController.editTask(taskId, newName);
        }

        editName(task.element, task.Id, onEnter);

        let editTaskBtn = task.element.querySelector('.editTaskBtn');
        editTaskBtn.addEventListener('click', function () { renderer.enableEditMode(task.element) });
    }


    let exports = {
        attachProjectEvents: function (project) {
            editProject(project);
            deleteProject(project);
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
            renderer.renderTask(project, project.Tasks[i]);
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
        renderTask: function (project, task) {
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
            renderer.enableEditMode(project.element);
            return project;
        },
        enableEditMode: function (element) {
            let input = element.querySelector('input');
            input.disabled = false;
            input.focus();
            $(input).select();
        },
        disableEditMode: function (element) {
            let input = element.querySelector('input');
            input.selectionEnd = input.selectionStart;
            input.disabled = true;
        },
        removeElFromPage: function (el) {
            el.remove();
        }
    };
    return exports;
})();