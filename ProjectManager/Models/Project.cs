namespace ProjectManager.Models
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    [Table("Project")]

    public partial class Project
    {
        public Project()
        {
            Tasks = new HashSet<Task>();
        }

        [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }


        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        public int UserId { get; set; }

        public virtual User User { get; set; }

        public virtual ICollection<Task> Tasks { get; set; }

        //public ProjectSerializable ToSerializable()
        //{
        //    return new ProjectSerializable { Id = this.Id, Name = this.Name, UserId = this.UserId };
        //}
    }

    //public class ProjectSerializable
    //{
    //    public ProjectSerializable()
    //    {
    //        Tasks = new List<TaskSerializable>();
    //    }
    //    public int Id { get; set; }
    //    public string Name { get; set; }
    //    public int UserId { get; set; }

    //    public List<Models.TaskSerializable> Tasks { get; set; }
    //}
}
