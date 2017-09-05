using Newtonsoft.Json;

namespace ProjectManager.Helpers
{
    public class Helper
    {
        public static string ToJson(object obj)
        {
            var serializeSettings = new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            };

            return JsonConvert.SerializeObject(obj, Formatting.Indented, serializeSettings);
        }
    }
}