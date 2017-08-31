namespace ProjectManager.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("Task")]
    public partial class Task
    {
        [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        public int ProjectId { get; set; }

        public virtual Project Project { get; set; }

        //public TaskSerializable ToSerializable()
        //{
        //    return new TaskSerializable { Id = this.Id, Name = this.Name, ProjectId = this.ProjectId };
        //}
    }

    //public class TaskSerializable
    //{
    //    public int Id { get; set; }
    //    public string Name { get; set; }
    //    public int ProjectId { get; set; }
    //}
}
