using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NetCoreAuth.Core;
using NetCoreAuth.Core.DTOs;
using NetCoreAuth.Core.Exceptions;
using NetCoreAuth.Data.Model;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NetCoreAuth.Web.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountApiController : ControllerBase
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public AccountApiController(SignInManager<ApplicationUser> signInManager,
            UserManager<ApplicationUser> userManager)
        {
            _signInManager = signInManager;
            _userManager = userManager;
        }

        [HttpPost]
        [Route("CreateUser")]
        public async Task<IActionResult> CreateUser(CreateUserDTO dto)
        {
            string message = string.Empty;
            if (string.IsNullOrEmpty(dto.FirstName)) message += "FirstName is required. ";
            if (string.IsNullOrEmpty(dto.LastName)) message += "LastName is required. ";
            if (string.IsNullOrEmpty(dto.Email)) message += "Email is required. ";
            if (string.IsNullOrEmpty(dto.Password)) message += "Password is required. ";

            if(_userManager.FindByEmailAsync(dto.Email) != null)
            {
                throw new Exception("Email is already taken.");
            }

            ApplicationUser user = new ApplicationUser()
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                UserName = dto.Email,
            };

            var principal = await _signInManager.CreateUserPrincipalAsync(user);
            var result = await _userManager.CreateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new LoginResponseDTO()
                {
                    IsAuthenticated = true,
                    Message = string.Empty,
                    Email = dto.Email,
                });
            }
            else
            {
                message += "User with email " + dto.Email + " was not found. ";
            }

            return Ok(new LoginResponseDTO()
            {
                IsAuthenticated = false,
                Message = message
            });
        }

        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login(LoginDTO dto)
        {
            string message = "Ivalid username or password. ";
            if (string.IsNullOrEmpty(dto.Email)) message += "Email is required. ";
            if (string.IsNullOrEmpty(dto.Password)) message += "Password is required. ";
           
            var user = await _userManager.FindByEmailAsync(dto.Email);

            if(user == null)
            {
                throw new EndUserException("User with email " + dto.Email + " does not exist.");
            }
            else
            {
                // TODO: Do we need both of these? SignInAsync + PasswordSignInAsync
                var claimsPrincipal = await _signInManager.CreateUserPrincipalAsync(user);

                await _signInManager.Context.SignInAsync(claimsPrincipal);

                var result = await _signInManager.PasswordSignInAsync(dto.Email, dto.Password, true, lockoutOnFailure: false);

                if (result.Succeeded)
                {
                    return Ok(new LoginResponseDTO()
                    {
                        UserId = user.Id,
                        IsAuthenticated = true,
                        Message = string.Empty,
                        Email = dto.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                    });
                }
            }                     

            return Ok(new LoginResponseDTO()
            {
                IsAuthenticated = false,
                Message = message
            });
        }

        [HttpGet]
        [Route("Logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Redirect("/login");
        }

        [HttpGet]
        [Route("GetCurrentUser")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var isUserSignedIn = _signInManager.IsSignedIn(User);
            var isUserAuthenticated = User.Identity.IsAuthenticated;

            if (!isUserAuthenticated || !isUserSignedIn)
            {
                return Unauthorized();
            }

            // Why can't I use ClaimTypes.Email here? Has to be "email"
            var email = User.FindFirstValue("email");
            var user = await _userManager.FindByEmailAsync(email);

            return Ok(new UserSecurityDTO
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
            });
        }
    }
}