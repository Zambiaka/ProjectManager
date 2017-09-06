using ProjectManager.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ProjectManager.Controllers
{
    public class UserController : Controller
    {
        private ProjectManagerContext db = new ProjectManagerContext();

        [HttpPost]
        public JsonResult Register(object[] data)
        {
            string login = data[0].ToString();
            string name = data[1].ToString();

            var user = db.Users.Where(u => u.Login == login).ToList().First();

            if (user == null)
            {
                var hash = SecurePasswordHasher.Hash(data[2].ToString());
                db.Users.Add(new Models.User { Hash = hash, Login = login, Name = name });
                db.SaveChanges();
                return Json("success");
            }
            else
            {
                return Json("exists");
            }
        }

        [HttpPost]
        public JsonResult Login(object[] data)
        {
            string login = data[0].ToString();
            var user = db.Users.Where(u => u.Login == login).ToList().First();
            if (user != null)
            {
                var result = SecurePasswordHasher.Verify(data[1].ToString(), user.Hash);
                if (result == true)
                {
                    return Json("success");
                }
                return Json("invalid");
            }
            return Json("notFound");
        }
    }
}