using EduSupport.Api.Data;
using EduSupport.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduSupport.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Tickets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets()
        {
            return await _context.Tickets
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        // GET: api/Tickets/1
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
            {
                return NotFound();
            }

            return ticket;
        }

        // POST: api/Tickets
        [HttpPost]
        public async Task<ActionResult<Ticket>> CreateTicket(Ticket ticket)
        {
            // Validate student
            var student = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == ticket.StudentId &&
                    u.IsActive);

            if (student == null)
            {
                return BadRequest(
                    "Student user not found or inactive.");
            }

            if (student.Role != "Student")
            {
                return BadRequest(
                    "Selected user is not a student.");
            }

            // Validate category
            var category = await _context.Categories
                .FirstOrDefaultAsync(c =>
                    c.Id == ticket.CategoryId &&
                    c.IsActive);

            if (category == null)
            {
                return BadRequest(
                    "Ticket category not found or inactive.");
            }

            // Validate priority
            var allowedPriorities = new[]
            {
                "Low",
                "Medium",
                "High",
                "Urgent"
            };

            if (!allowedPriorities.Contains(ticket.Priority))
            {
                return BadRequest(
                    "Invalid ticket priority.");
            }

            var now = DateTime.UtcNow;

            ticket.TicketNumber =
                $"TKT-{now:yyyyMMddHHmmssfff}";

            ticket.CreatedAt = now;
            ticket.UpdatedAt = now;
            ticket.Status = "Open";

            // Calculate SLA due date during ticket creation
            ticket.DueAt = now
                .AddHours(category.DefaultSlaHours);

            _context.Tickets.Add(ticket);

            await _context.SaveChangesAsync();

            await AddHistory(
                ticket.Id,
                ticket.StudentId,
                "Ticket Created",
                null,
                "Open");

            return CreatedAtAction(
                nameof(GetTicket),
                new { id = ticket.Id },
                ticket);
        }

        // PATCH: api/Tickets/1/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromBody] string status)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
            {
                return NotFound();
            }

            var allowedStatuses = new[]
            {
                "Open",
                "Assigned",
                "InProgress",
                "PendingStudent",
                "PendingInternal",
                "Resolved",
                "Closed",
                "Reopened",
                "Escalated"
            };

            if (!allowedStatuses.Contains(status))
            {
                return BadRequest(
                    "Invalid ticket status.");
            }

            var oldStatus = ticket.Status;

            ticket.Status = status;
            ticket.UpdatedAt = DateTime.UtcNow;

            if (status == "Resolved")
            {
                ticket.ResolvedAt = DateTime.UtcNow;
            }

            if (status == "Closed")
            {
                ticket.ClosedAt = DateTime.UtcNow;
            }

            if (status == "Reopened")
            {
                ticket.ResolvedAt = null;
                ticket.ClosedAt = null;
            }

            await _context.SaveChangesAsync();

            await AddHistory(
                ticket.Id,
                ticket.StudentId,
                "Status Changed",
                oldStatus,
                status);

            return Ok(ticket);
        }

        // PATCH: api/Tickets/1/assign
        [HttpPatch("{id}/assign")]
        public async Task<IActionResult> AssignTicket(
            int id,
            [FromBody] AssignTicketRequest request)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
            {
                return NotFound(
                    "Ticket not found.");
            }

            var staff = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == request.StaffId &&
                    u.IsActive);

            if (staff == null)
            {
                return BadRequest(
                    "Staff user not found or inactive.");
            }

            if (staff.Role != "Staff" &&
                staff.Role != "Admin")
            {
                return BadRequest(
                    "Selected user is not a staff member.");
            }

            var category = await _context.Categories
                .FindAsync(ticket.CategoryId);

            if (category == null)
            {
                return BadRequest(
                    "Ticket category not found.");
            }

            // Deactivate previous assignments
            var previousAssignments =
                await _context.TicketAssignments
                    .Where(a =>
                        a.TicketId == id &&
                        a.IsActive)
                    .ToListAsync();

            foreach (var assignment in previousAssignments)
            {
                assignment.IsActive = false;
            }

            // Create new assignment
            var newAssignment =
                new TicketAssignment
                {
                    TicketId = ticket.Id,
                    StaffId = request.StaffId,
                    AssignedById = request.AssignedById,
                    AssignedAt = DateTime.UtcNow,
                    IsActive = true
                };

            _context.TicketAssignments
                .Add(newAssignment);

            var oldAssignedTo =
                ticket.AssignedToId?.ToString();

            ticket.AssignedToId =
                request.StaffId;

            ticket.Status = "Assigned";
            ticket.UpdatedAt = DateTime.UtcNow;

            // Recalculate SLA when assigned
            ticket.DueAt = DateTime.UtcNow
                .AddHours(category.DefaultSlaHours);

            await _context.SaveChangesAsync();

            await AddHistory(
                ticket.Id,
                request.AssignedById,
                "Ticket Assigned",
                oldAssignedTo,
                request.StaffId.ToString());

            return Ok(new
            {
                message =
                    "Ticket assigned successfully.",
                ticketId = ticket.Id,
                assignedTo = staff.Name,
                status = ticket.Status,
                dueAt = ticket.DueAt
            });
        }

        public class AssignTicketRequest
        {
            public int StaffId { get; set; }

            public int AssignedById { get; set; }
        }

        // GET: api/Tickets/1/history
        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<TicketHistory>>>
            GetHistory(int id)
        {
            var ticketExists =
                await _context.Tickets
                    .AnyAsync(t => t.Id == id);

            if (!ticketExists)
            {
                return NotFound();
            }

            return await _context.TicketHistories
                .Where(h => h.TicketId == id)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();
        }

        // Add ticket history
        private async Task AddHistory(
            int ticketId,
            int userId,
            string action,
            string? oldValue,
            string? newValue)
        {
            var history = new TicketHistory
            {
                TicketId = ticketId,
                UserId = userId,
                Action = action,
                OldValue = oldValue,
                NewValue = newValue,
                CreatedAt = DateTime.UtcNow
            };

            _context.TicketHistories.Add(history);

            await _context.SaveChangesAsync();
        }

        // GET: api/Tickets/ageing
        [HttpGet("ageing")]
        public async Task<IActionResult>
            GetTicketAgeing()
        {
            var now = DateTime.UtcNow;

            var tickets = await _context.Tickets
                .OrderBy(t => t.DueAt)
                .Select(t => new
                {
                    t.Id,
                    t.TicketNumber,
                    t.Subject,
                    t.Priority,
                    t.Status,
                    t.AssignedToId,
                    t.CreatedAt,
                    t.DueAt,

                    AgeingHours =
                        Math.Round(
                            (now - t.CreatedAt)
                                .TotalHours,
                            2),

                    IsSlaBreached =
                        t.DueAt != null &&
                        t.DueAt < now &&
                        t.Status != "Resolved" &&
                        t.Status != "Closed"
                })
                .ToListAsync();

            return Ok(tickets);
        }

        // POST: api/Tickets/check-sla
        [HttpPost("check-sla")]
        public async Task<IActionResult>
            CheckSla()
        {
            var now = DateTime.UtcNow;

            var tickets =
                await _context.Tickets
                    .Where(t =>
                        t.DueAt != null &&
                        t.DueAt < now &&
                        t.Status != "Resolved" &&
                        t.Status != "Closed" &&
                        t.Status != "Escalated")
                    .ToListAsync();

            foreach (var ticket in tickets)
            {
                ticket.Status = "Escalated";
                ticket.UpdatedAt = now;

                await AddHistory(
                    ticket.Id,
                    ticket.AssignedToId
                        ?? ticket.StudentId,
                    "SLA Breached",
                    "Active",
                    "Escalated");
            }

            return Ok(new
            {
                message =
                    "SLA check completed successfully.",

                checkedAt = now,

                escalatedCount =
                    tickets.Count
            });
        }
    }
}
