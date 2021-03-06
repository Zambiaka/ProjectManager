﻿using ProjectManager.Helpers;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web.Mvc;

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
                projects.Add(Helper.ToJson(project));
            }

            return Json(projects);
        }


        [HttpPost]
        public JsonResult Delete(int[] data)
        {
            int projectId = data[0];
            db.Projects.Remove(db.Projects.Find(projectId));
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                //TODO 
            }
            return Json('f');
        }

        [HttpPost]
        public JsonResult Add(object[] data)
        {
            string projectName = data[0].ToString();
            int userId = Convert.ToInt32(data[1]);
            var project = new Models.Project { Name = projectName, UserId = userId, User= db.Users.Find(userId) };
            db.Projects.Add(project);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                //TODO 
            }
            return Json(Helper.ToJson(project));
        }


        [HttpPost]
        public JsonResult Edit(object[] data)
        {
            string projectName = data[1].ToString();
            int projectId = Convert.ToInt32(data[0]);

            var project = db.Projects.Find(projectId);
            project.Name = projectName;

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