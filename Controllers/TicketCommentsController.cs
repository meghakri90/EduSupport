using EduSupport.Api.Data;
using EduSupport.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduSupport.Api.Controllers
{
    [ApiController]
    [Route("api/tickets/{ticketId}/comments")]
    public class TicketCommentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketCommentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/tickets/1/comments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketComment>>> GetComments(int ticketId)
        {
            var ticketExists = await _context.Tickets
                .AnyAsync(t => t.Id == ticketId);

            if (!ticketExists)
            {
                return NotFound("Ticket not found.");
            }

            return await _context.TicketComments
                .Where(c => c.TicketId == ticketId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        // POST: api/tickets/1/comments
        [HttpPost]
        public async Task<ActionResult<TicketComment>> AddComment(
            int ticketId,
            TicketComment comment)
        {
            var ticket = await _context.Tickets
                .FindAsync(ticketId);

            if (ticket == null)
            {
                return NotFound("Ticket not found.");
            }

            if (string.IsNullOrWhiteSpace(comment.CommentText))
            {
                return BadRequest("Comment cannot be empty.");
            }

            comment.TicketId = ticketId;
            comment.CreatedAt = DateTime.UtcNow;

            _context.TicketComments.Add(comment);

            ticket.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(comment);
        }
    }
}