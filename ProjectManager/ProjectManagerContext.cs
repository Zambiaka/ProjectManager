namespace ProjectManager
{
    using Models;
    using System.Data.Entity;
    public partial class ProjectManagerContext : DbContext
    {
        public ProjectManagerContext()
            : base("name=ProjectManagerContext")
        {
        }

        public virtual DbSet<Project> Projects { get; set; }
        public virtual DbSet<Task> Tasks { get; set; }
        public virtual DbSet<User> Users { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Project>()
                    .HasMany(e => e.Tasks)
                    .WithRequired(e => e.Project)
                    .WillCascadeOnDelete(false);

            modelBuilder.Entity<User>()
                .HasMany(e => e.Projects)
                .WithRequired(e => e.User)
                .WillCascadeOnDelete(false);
        }
    }
}
