using ProjectManager.Helpers;
using ProjectManager.Models;
using System;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web.Mvc;

namespace ProjectManager.Controllers
{
    public class TasksController : Controller
    {
        private ProjectManagerContext db = new ProjectManagerContext();

        [HttpPost]
        public JsonResult Delete(int[] data)
        {
            int taskId = Convert.ToInt32(data[0]);
            db.Tasks.Remove(db.Tasks.Find(taskId));
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                //TODO 
            }

            //TODO
            return Json("");
        }

        [HttpPost]
        public JsonResult Edit(object[] data)
        {
            int taskId = Convert.ToInt32(data[0]);
            string taskName = data[1].ToString();

            var task = db.Tasks.Find(taskId);
            task.Name = taskName;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                //TODO 
            }

            ////Don't need to return this
            return Json("");
        }

        [HttpPost]
        public JsonResult ChangeStatus(object[] data)
        {
            bool status = (bool)data[0];
            int taskId = Convert.ToInt32(data[1]);


            var task = db.Tasks.Find(taskId);
            task.Status = status;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                //TODO 
            }

            ////Don't need to return this
            return Json("");
        }

        [HttpPost]
        public JsonResult Add(object[] data)
        {
            int projectId = Convert.ToInt32(data[0]);
            string taskName = data[1].ToString();
            var project = db.Projects.Find(projectId);
            int maxPriorityTask = 0;
            if (project.Tasks.Count > 0)
            {
                maxPriorityTask = project.Tasks.Max(t => t.Priority);
            }

            var task = new Models.Task { Name = taskName, ProjectId = projectId, Project = db.Projects.Find(projectId), Priority = maxPriorityTask + 1 };
            project.Tasks.Add(task);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                //TODO 
            }

            ////Don't need to return this
            return Json(Helper.ToJson(task));
        }

        [HttpPost]
        public JsonResult IncreasePriority(object[] data)
        {
            int taskId = Convert.ToInt32(data[0]);
            var task = db.Tasks.Find(taskId);
            var project = db.Projects.Find(task.ProjectId);
            int taskPriority = task.Priority;

            var taskWithHigherPriority = (from t in project.Tasks
                                          where t.Priority < taskPriority
                                          select t).OrderBy(t => t.Priority).First();
            task.Priority = taskWithHigherPriority.Priority;
            taskWithHigherPriority.Priority = taskPriority;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                //TODO 
            }

            return Json("");
        }


        [HttpPost]
        public JsonResult DecreasePriority(object[] data)
        {
            int taskId = Convert.ToInt32(data[0]);
            var task = db.Tasks.Find(taskId);
            var project = db.Projects.Find(task.ProjectId);
            int taskPriority = task.Priority;

            var taskWithLowerPriority = (from t in project.Tasks
                                          where t.Priority > taskPriority
                                          select t).OrderBy(t => t.Priority).First();
            task.Priority = taskWithLowerPriority.Priority;
            taskWithLowerPriority.Priority = taskPriority;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                //TODO 
            }

            return Json("");
        }

    }
}