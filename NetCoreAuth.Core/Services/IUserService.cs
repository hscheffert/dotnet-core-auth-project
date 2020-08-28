using NetCoreAuth.Core.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NetCoreAuth.Core.Services
{
    public interface IUserService
    {
        Task<UserDTO> GetById(string id);
        IEnumerable<UserDTO> GetAll();
        TableResponseDTO<UserDTO> GetDataTableResponse(TableRequestDTO tableRequest);
    }
}
