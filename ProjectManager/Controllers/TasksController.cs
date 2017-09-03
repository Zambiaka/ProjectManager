using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity.Infrastructure;
using System.Web.Mvc;
using Newtonsoft.Json;

namespace ProjectManager.Controllers
{
    public class TasksController: Controller
    {
        private ProjectManagerContext db = new ProjectManagerContext();

        [HttpPost]
        public JsonResult DeleteTask(int[] data)
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
        public JsonResult EditTask(object[] data)
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
    }
}