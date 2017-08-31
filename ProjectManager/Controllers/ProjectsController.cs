using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity.Infrastructure;
using System.Web.Mvc;
using Newtonsoft.Json;

namespace ProjectManager.Controllers
{
  
        public class ProjectsController : Controller
        {
            private ProjectManagerContext db = new ProjectManagerContext();

            [HttpPost]
            public JsonResult GetProjects(int[] data)
            {
                int userId = data[0];
                var currentUserProjects = db.Projects.Where(u => u.UserId == userId).ToList();
                List<string> projects = new List<string>();

                foreach (var project in currentUserProjects)
                {
                    //var serializableProject = project.ToSerializable();
                    var tasks = db.Tasks.Where(task => task.ProjectId == project.Id).ToList();

                    foreach (var task in tasks)
                    {
                        //var serializableTask = task.ToSerializable();
                        //serializableProject.Tasks.Add(serializableTask);
                    }
                var p = JsonConvert.SerializeObject(project);
                    //projects.Add(JsonConvert.SerializeObject(serializableProject));
                }

                return Json(projects);
            }

            //[HttpPost]
            //public JsonResult AddProject(object[] data)
            //{
            //    string projectName = data[0].ToString();
            //    int userId = Convert.ToInt32(data[1]);
            //    var project = new Models.Project { Name = projectName, UserId = userId };
            //    db.Projects.Add(project);

            //    try
            //    {
            //        db.SaveChanges();
            //    }
            //    catch (DbUpdateException ex)
            //    {
            //        //TODO 
            //    }
            //    return Json(project.ToSerializable());
            //}
        
    }
}