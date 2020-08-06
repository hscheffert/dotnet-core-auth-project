using System;
using System.Collections.Generic;
using NetCoreAuth.Core.DTOs;

namespace NetCoreAuth.Core.Services
{
    public interface IUserService
    {
        public UserDTO GetByID(Guid id);
        public List<UserDTO> GetAll();
    }
}
