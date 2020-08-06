using System;

namespace NetCoreAuth.Core.DTOs
{
    public partial class UserDTO
    {
        public UserDTO()
        {
        }

        public UserDTO(Guid id)
            : this()
        {
            this.UserId = id;
        }

        public Guid UserId { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
