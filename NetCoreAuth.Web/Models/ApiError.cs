using Newtonsoft.Json;

namespace NetCoreAuth.Web.Models
{
    public class ApiError
    {
        public int StatusCode { get; set; }
        public string ExceptionType { get; set; }
        public string Message { get; set; }
        public string MessageDetail { get; set; }
        public override string ToString()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}
