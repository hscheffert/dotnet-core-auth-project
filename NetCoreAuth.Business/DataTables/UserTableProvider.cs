using Microsoft.AspNetCore.Identity;
using NetCoreAuth.Core.DataTables;
using NetCoreAuth.Core.DTOs;
using NetCoreAuth.Data.Model;
using System.Linq;

namespace NetCoreAuth.Business.DataTables
{
    public class UserTableProvider : DataTablesProvider<ApplicationUser, UserDTO>
    {
        private UserManager<ApplicationUser> _userManager;

        public UserTableProvider(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }
        protected override bool CountTotalRecords
        {
            get { return true; }
        }

        protected override bool CountFilteredRecords
        {
            get { return true; }
        }

        protected override IQueryable<ApplicationUser> GetBaseQuery(TableRequestDTO request)
        {
            return _userManager.Users;
        }

        protected override OrderByExpression GetOrderBy(string columnName)
        {
            switch (columnName)
            {
                case null:
                case "":
                    return OrderBy(p => p.LastName);
                default:
                    return base.OrderBy();
            }
        }

        protected override IQueryable<UserDTO> TransformResults(IQueryable<ApplicationUser> results)
        {
            return UserDTO.Select(results);
        }
    }
}
