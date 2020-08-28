using Microsoft.AspNetCore.Identity;
using NetCoreAuth.Business.DataTables;
using NetCoreAuth.Core.DTOs;
using NetCoreAuth.Core.Services;
using NetCoreAuth.Data.Model;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetCoreAuth.Business.Services
{
    public class UserService : IUserService
    {
        private readonly DB _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public UserService(DB db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        public IEnumerable<UserDTO> GetAll()
        {
            return UserDTO.Select(_userManager.Users)
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .ToList();
        }

        public async Task<UserDTO> GetById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            return UserDTO.Select(user);
        }
       
        public TableResponseDTO<UserDTO> GetDataTableResponse(TableRequestDTO tableRequest)
        {
            return new UserTableProvider(_userManager).ExecuteRequest(tableRequest);
        }
    }
}
