namespace EduSupport.Api.Models
{
    public class TicketAssignment
    {
        public int Id { get; set; }

        public int TicketId { get; set; }

        public int StaffId { get; set; }

        public int AssignedById { get; set; }

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }
}