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
                userExists = db.Users.Where(u => u.Login == login).ToList().Count>0;
            }

            if (!userExists)
            {
                var hash = SecurePasswordHasher.Hash(data[1].ToString());
                var newUser = new Models.User { Hash = hash, Login = login, Name = name };
                db.Users.Add(newUser);
                db.SaveChanges();
                List<string> result = new List<string>();
                result.Add("Account created");
                result.Add(newUser.Id.ToString());
                return Json(result);
            }
            else
            {
                return Json("Login already exists");
            }
        }

        [HttpPost]
        public JsonResult Login(object[] data)
        {
            string login = data[0].ToString();
            if (db.Users.Count() > 0)
            {
                var user = db.Users.Where(u => u.Login == login).ToList().First();
                if (user != null)
                {
                    var result = SecurePasswordHasher.Verify(data[1].ToString(), user.Hash);
                    if (result == true)
                    {
                        return Json("loginSuccessful");
                    }
                }
            }
            return Json("notFound");
        }
    }
}