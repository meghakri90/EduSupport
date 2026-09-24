namespace EduSupport.Api.Models
{
    public class Category
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public int DefaultSlaHours { get; set; } = 48;

        public bool IsActive { get; set; } = true;
    }
}
