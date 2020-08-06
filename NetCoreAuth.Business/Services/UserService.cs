using NetCoreAuth.Core.DTOs;
using NetCoreAuth.Core.Services;
using NetCoreAuth.Data.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace NetCoreAuth.Business.Services
{
    public class UserService: IUserService
    {
        private readonly DB _db;

        public UserService(DB db)
        {
            this._db = db;
        }

        public List<UserDTO> GetAll()
        {
            throw new NotImplementedException();
        }

        public UserDTO GetByID(Guid id)
        {
            throw new NotImplementedException();
        }

        //public UserDTO GetByID(Guid id)
        //{

        //    var dto = _db.User
        //        .Where(x => x.UserId == id)
        //        .Select(x => new UserDTO()
        //        {
        //            UserId = x.UserId,
        //            FirstName = x.FirstName,
        //            LastName = x.LastName,
        //            Email = x.Email,
        //        })
        //        .FirstOrDefault();

        //    return dto;
        //}

        //public List<UserDTO> GetAll()
        //{
        //    var dtos = _db.User
        //        .Select(x => new UserDTO()
        //        {
        //            UserId = x.UserId,
        //            FirstName = x.FirstName,
        //            LastName = x.LastName,
        //            Email = x.Email,
        //        });            

        //    return dtos
        //        .OrderBy(x => x.LastName)
        //        .ThenBy(x => x.FirstName)
        //        .ToList();
        //}
    }
}
