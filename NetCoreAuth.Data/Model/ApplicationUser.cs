using Microsoft.AspNetCore.Identity;

namespace NetCoreAuth.Data.Model
{
    // To change from string Id to Guid
    // https://docs.microsoft.com/en-us/aspnet/core/security/authentication/customize-identity-model?view=aspnetcore-3.1#change-the-primary-key-type
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
