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
        saveProject: function (project) {
            projects.push(project);
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
        }
    };

    return exports;
})();

let eventManager = (function () {

    function editProject(project) {
        let projectNameInput = project.element.querySelector('.projectName');
        $(projectNameInput).off();
        let oldProjectName = projectNameInput.value;
        $(projectNameInput).on('keydown', function (e) {
            const enterKey = 13;
            const escKey = 27;
            if (e.keyCode === enterKey) {
                renderer.disableEditProjectMode(project.element);
                if (projectNameInput.value !== oldProjectName) {
                    //TODO name validation
                    ajaxController.editProject(project.Id, projectNameInput.value);
                }
            } else if (e.keyCode === escKey) {
                projectNameInput.value = oldProjectName;
                renderer.disableEditProjectMode(project.element);
            }
        });

        let editProjectBtn = project.element.querySelector('.editProjectBtn');
        editProjectBtn.addEventListener('click', function () { renderer.enableEditProjectMode(project) });
    }

    //TODO refactor this
    function projectTemplate(project) {
        let projectNameInput = project.element.querySelector('.projectName');
        let oldProjectName = projectNameInput.value;
        $(projectNameInput).on('keydown', function (e) {
            const enterKey = 13;
            const escKey = 27;
            if (e.keyCode === enterKey) {
                renderer.disableEditProjectMode(project.element);
                //TODO
                let userId = 1;
                ajaxController.addProject(projectNameInput.value, userId).then(dataManager.saveProject);
                eventManager.attachProjectEvents(project);
            } else if (e.keyCode === escKey) {
                renderer.removeProjectElFromPage(project.element);
            }
        });
    }

    function deleteProject(project) {
        let deleteProjectBtn = project.element.querySelector('.deleteProjectBtn');
        deleteProjectBtn.addEventListener('click', function (event) {
            ajaxController.deleteProject(project.Id);
            renderer.removeProjectElFromPage(project.element);

            //remove project from collection
            let index = projects.indexOf(project);
            projects.splice(index, 1);

            event.preventDefault();
            event.stopImmediatePropagation();
        });
    }

    let exports = {
        attachProjectEvents: function (project) {
            editProject(project);
            deleteProject(project);
        },
        attachEvents: function (projects) {
            for (let i = 0; i < projects.length; i++) {
                eventManager.attachProjectEvents(projects[i]);
            }
        },
        attachProjectTemplateEvents: function (project) {
            projectTemplate(project);
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
            taskNameRow.innerText = task.Name;
            task.element = content.querySelector('.task');
            document.importNode(content);
            tasksContainer.appendChild(content.cloneNode(true));
            project.element.appendChild(tasksContainer);
        },
        createProject: function () {
            //TODO create increment New TODO List(1), then New TODO List(2)
            //TODO input style width, on focus 
            let project = renderer.renderProject({ Name: "New TODO List" });
            renderer.enableEditProjectMode(project);
            return project;
        },
        enableEditProjectMode: function (project) {
            let projectNameInput = project.element.querySelector('.projectName');
            projectNameInput.disabled = false;
            projectNameInput.focus();
            $(projectNameInput).select();
        },
        disableEditProjectMode: function (projectEl) {
            let projectNameInput = projectEl.querySelector('.projectName');
            projectNameInput.disabled = true;;
        },
        removeProjectElFromPage: function (projectEl) {
            renderer.projectSection.removeChild(projectEl);
        }
    };
    return exports;
})();