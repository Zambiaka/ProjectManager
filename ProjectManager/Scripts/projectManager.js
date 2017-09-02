document.addEventListener('DOMContentLoaded', function (event) {
    console.log('DOMContentLoaded');
    renderer.projectSection = document.getElementById('projectsSection');
    ajaxController.getInitalizeData().then(saveData).then(renderer.renderProjectCollection);
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

    let exports = {
        projectSection:null,
        renderProjectCollection: function (projects) {
            for (let i = 0; i < projects.length; i++) {
               renderer.renderProject(projects[i]);
            }
        },
        renderProject: function (project) {
            let content = getProjectDOM();
            //TODO refactor this
            project.element = content.querySelector('.projectContainer');
            let projectNameDiv = content.querySelector('.projectName');
            projectNameDiv.innerText = project.Name;
            document.importNode(content);
            renderer.projectSection.appendChild(content.cloneNode(true));
        },
        renderTask: function (project) {
            let taskContainer = project.element.querySelector('.taskList');
            if (!taskContainer) {
                taskContainer = document.createElement('ul').classList.add('.taskList');
                project.element.appendChild(taskContainer);
            }
        }
    };
    return exports;
})();