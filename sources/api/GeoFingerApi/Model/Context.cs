using Microsoft.EntityFrameworkCore;

namespace GeoFingerApi.Model
{
    public class Context : DbContext
    {
        protected readonly IConfiguration Configuration;

        public Context(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            Console.WriteLine("CONNECTION STRING: " + Configuration.GetConnectionString("Context"));
            options.UseSqlServer(Configuration.GetConnectionString("Context"), options => options.EnableRetryOnFailure());
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<MessageDataStore>()
                           .Property(p => p.lat)
                           .HasPrecision(12, 8);

            builder.Entity<MessageDataStore>()
                           .Property(p => p.lon)
                           .HasPrecision(12, 8);


            base.OnModelCreating(builder);
        }




        public DbSet<MessageDataStore> MessageData { get; set; }

    }
}
