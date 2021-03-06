﻿namespace ProjectManager.Models
{
    using Newtonsoft.Json;
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

        public bool Status { get; set; }

        public int Priority { get; set; }

        [JsonIgnore]
        public virtual Project Project { get; set; }
    }
}
