using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ProjectManager
{
    public class UserStore
    {
        private static int _currentUser = 0;
        public static int CurrentUserId
        {
            get { return _currentUser; }
            set { _currentUser = value; }
        }
    }
}