using IdentityServer4.EntityFramework.Options;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace NetCoreAuth.Data.Model
{
    public partial class DB : ApiAuthorizationDbContext<ApplicationUser>
    {
        public DB(
            DbContextOptions options,
            IOptions<OperationalStoreOptions> operationalStoreOptions) : base(options, operationalStoreOptions)
        {
        }

        //public virtual DbSet<User> User { get; set; }

        //protected override void OnModelCreating(ModelBuilder modelBuilder)
        //{            
        //    modelBuilder.Entity<User>(entity =>
        //    {
        //        entity.Property(e => e.UserId).ValueGeneratedNever();

        //        entity.Property(e => e.CreatedBy).IsUnicode(false);

        //        entity.Property(e => e.Email).IsUnicode(false);

        //        entity.Property(e => e.FirstName).IsUnicode(false);

        //        entity.Property(e => e.LastName).IsUnicode(false);

        //        entity.Property(e => e.MiddleName).IsUnicode(false);

        //        entity.Property(e => e.UpdatedBy).IsUnicode(false);
        //    });

        //    OnModelCreatingPartial(modelBuilder);
        //}

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);

    }
}
