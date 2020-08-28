using NetCoreAuth.Data.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace NetCoreAuth.Core.DTOs
{
    public partial class UserDTO
    {
        private static readonly Expression<Func<ApplicationUser, UserDTO>> _dtoExpression;
        private static readonly Func<ApplicationUser, UserDTO> _dtoFunc;

        static UserDTO()
        {
            _dtoExpression = GetDtoSelector();
            _dtoFunc = _dtoExpression.Compile();
        }

        public string Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

        public static IQueryable<UserDTO> Select(IQueryable<ApplicationUser> entities)
        {
            return entities.Select(_dtoExpression);
        }

        public static IEnumerable<UserDTO> Select(IEnumerable<ApplicationUser> entities)
        {
            return entities.Select(_dtoFunc);
        }

        public static UserDTO Select(ApplicationUser entity)
        {
            return _dtoFunc(entity);
        }

        private static Expression<Func<ApplicationUser, UserDTO>> GetDtoSelector()
        {
            Expression<Func<ApplicationUser, UserDTO>> func = e => new UserDTO
            {
                Id = e.Id,
                Email = e.Email,
                FirstName = e.FirstName,
                LastName = e.LastName,
            };

            return func;
        }
    }
}
