using Microsoft.AspNetCore.Mvc;
using NetCoreAuth.Core.DTOs;
using NetCoreAuth.Core.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NetCoreAuth.Web.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserApiController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserApiController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Route("GetAll")]
        public IEnumerable<UserDTO> GetAll()
        {
            return _userService.GetAll();
        }

        [HttpGet]
        [Route("GetById/{id}")]
        public async Task<UserDTO> GetById(string id)
        {
            return await _userService.GetById(id);
        }

        [HttpPost]
        [Route("GetDataTableResponse")]
        public TableResponseDTO<UserDTO> GetDataTableResponse(TableRequestDTO tableRequestDTO)
        {
            return _userService.GetDataTableResponse(tableRequestDTO);
        }
    }
}
