document.addEventListener('DOMContentLoaded', function (event) {
    console.log('DOMContentLoaded');
    renderer.projectSection = document.getElementById('projectsSection');
    ajaxController
        .getInitalizeData()
        .then(saveData)
        .then(renderer.renderData)
        .then(eventManager.addEvents);

    let addProjectButton = document.getElementById("addProject");
    addProjectButton.addEventListener('click', function () {
        renderer.createProject();
    });
});



let projects = [];

function saveData(data) {
    projects = data.map(JSON.parse);
    return projects;
}

let ajaxController = (function () {
    //TODO Implement error handling
    function showError() {
        console.log('error in ajax');
    }

    let exports = {
        getInitalizeData: function () {
            return new Promise(function (resolve) {
                $.ajax({
                    type: "POST",
                    url: "/Projects/GetProjects",
                    data: JSON.stringify([1]),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: resolve,
                    error: showError
                });
            });
        },
        addProject: function (data) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: "/Projects/AddProject",
                    data: JSON.stringify([data.name, data.id]),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: resolve,
                    error: reject
                });
            });
        },
        deleteProject: function (projectId) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: "/Projects/DeleteProject",
                    data: JSON.stringify([projectId]),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: resolve,
                    error: reject
                });
            });
        },
    };

    return exports;
})();


let eventManager = (function () {
    let exports = {
        addProjectEvents: function (project) {
            let deleteProjectBtn = project.element.querySelector('.deleteProjectBtn');
            deleteProjectBtn.addEventListener('click', function (event) {
                ajaxController.deleteProject(project.Id);
               
                //remove from page
                renderer.projectSection.removeChild(project.element);

                //remove project from collection
                let index = projects.indexOf(project);
                projects.splice(index, 1);

                event.preventDefault();
                event.stopImmediatePropagation();
            });
        },
        addEvents: function (projects) {
            for (let i = 0; i < projects.length; i++) {
                eventManager.addProjectEvents(projects[i]);
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
            return project.element;
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
            let projectEl = renderer.renderProject({ Name: "New TODO List" });
            let projectNameInput = projectEl.querySelector('.projectName');
            projectNameInput.removeAttribute('disabled');
            projectNameInput.focus();
        }
    };
    return exports;
})();