using EduSupport.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduSupport.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Dashboard/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var now = DateTime.UtcNow;

            var totalTickets = await _context.Tickets.CountAsync();

            var openTickets = await _context.Tickets
                .CountAsync(t =>
                    t.Status == "Open" ||
                    t.Status == "Assigned" ||
                    t.Status == "InProgress");

            var pendingTickets = await _context.Tickets
                .CountAsync(t =>
                    t.Status == "PendingStudent" ||
                    t.Status == "PendingInternal");

            var resolvedTickets = await _context.Tickets
                .CountAsync(t =>
                    t.Status == "Resolved" ||
                    t.Status == "Closed");

            var escalatedTickets = await _context.Tickets
                .CountAsync(t => t.Status == "Escalated");

            var slaBreachedTickets = await _context.Tickets
                .CountAsync(t =>
                    t.DueAt != null &&
                    t.DueAt < now &&
                    t.Status != "Resolved" &&
                    t.Status != "Closed");

            return Ok(new
            {
                totalTickets,
                openTickets,
                pendingTickets,
                resolvedTickets,
                escalatedTickets,
                slaBreachedTickets
            });
        }
    }
}
