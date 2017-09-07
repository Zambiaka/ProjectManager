using ProjectManager.Helpers;
using ProjectManager.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ProjectManager.Controllers
{
    public class UsersController : Controller
    {
        private ProjectManagerContext db = new ProjectManagerContext();

        [HttpPost]
        public JsonResult Registration(object[] data)
        {
            string login = data[0].ToString();
            string name = data[2].ToString();
            bool userExists = false;

            if (db.Users.Count() > 0)
            {
                userExists = db.Users.Where(u => u.Login == login).ToList().Count > 0;
            }

            if (!userExists)
            {
                var hash = SecurePasswordHasher.Hash(data[1].ToString());
                var newUser = new Models.User { Hash = hash, Login = login, Name = name };
                db.Users.Add(newUser);
                db.SaveChanges();
                UserStore.CurrentUserId = newUser.Id;

                return Json(newUser.Id);
            }
            else
            {
                return Json(1000);
            }
        }

        [HttpPost]
        public JsonResult Login(object[] data)
        {
            string login = data[0].ToString();
            if (db.Users.Count() > 0)
            {
                var users = db.Users.Where(u => u.Login == login).ToList();

                if (users.Count > 0)
                {
                    var result = SecurePasswordHasher.Verify(data[1].ToString(), users.First().Hash);
                    if (result)
                    {
                        UserStore.CurrentUserId = users.First().Id;
                        return Json(users.First().Id);
                    }
                }
            }
            return Json(0);
        }

        [HttpPost]
        public JsonResult UserId()
        { 
            return Json(UserStore.CurrentUserId);
        }
    }
}