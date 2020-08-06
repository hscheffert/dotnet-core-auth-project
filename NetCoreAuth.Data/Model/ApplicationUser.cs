using Microsoft.AspNetCore.Identity;

namespace NetCoreAuth.Data.Model
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
