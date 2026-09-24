namespace EduSupport.Api.Models
{
    public class Ticket
    {
        public int Id { get; set; }

        public string TicketNumber { get; set; } = string.Empty;

        public int StudentId { get; set; }

        public int CategoryId { get; set; }

        public string Subject { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Priority { get; set; } = "Medium";

        public string Status { get; set; } = "Open";

        public int? AssignedToId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? DueAt { get; set; }

        public DateTime? ResolvedAt { get; set; }

        public DateTime? ClosedAt { get; set; }
    }
}
