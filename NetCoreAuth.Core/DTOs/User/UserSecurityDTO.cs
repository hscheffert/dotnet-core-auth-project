using System.Collections.Generic;

namespace NetCoreAuth.Core.DTOs
{
    public class UserSecurityDTO
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        //public IEnumerable<int> Roles { get; set; }
    }
}
