import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5293/api";

function App() {
  // =====================================================
  // APP STATE
  // =====================================================

  const [role, setRole] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");

  const [tickets, setTickets] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [dashboardData, setDashboardData] = useState(null);
  const [ageingTickets, setAgeingTickets] = useState([]);

  // Create ticket
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(1);
  const [priority, setPriority] = useState("Medium");

  // Messages
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Ticket details
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketComments, setTicketComments] = useState([]);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [newComment, setNewComment] = useState("");

  // LOAD TICKETS
  const loadTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/Tickets`);

      if (!response.ok) {
        throw new Error("Failed to load tickets.");
      }

      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Ticket loading error:", error);
      setErrorMessage("Unable to load tickets.");
    }
  };

  // LOAD USERS
  const loadStaffUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/Users`);

      if (!response.ok) {
        throw new Error("Failed to load users.");
      }

      const data = await response.json();

      const staff = data.filter(
        (user) =>
          user.role === "Staff" &&
          user.isActive === true
      );

      setStaffUsers(staff);
    } catch (error) {
      console.error("Staff loading error:", error);
    }
  };

  // LOAD CATEGORIES
  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/Categories`);

      if (!response.ok) {
        throw new Error("Failed to load categories.");
      }

      const data = await response.json();

      setCategories(data);

      if (data.length > 0) {
        setCategoryId(data[0].id);
      }
    } catch (error) {
      console.error("Category loading error:", error);
    }
  };
    // LOAD DASHBOARD
  const loadDashboard = async () => {
    try {
      const response = await fetch(
        `${API_URL}/Dashboard/summary`
      );

      if (!response.ok) {
        throw new Error("Dashboard loading failed.");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  // LOAD AGEING
  const loadAgeing = async () => {
    try {
      const response = await fetch(
        `${API_URL}/Tickets/ageing`
      );

      if (!response.ok) {
        throw new Error("Ageing data loading failed.");
      }

      const data = await response.json();
      setAgeingTickets(data);
    } catch (error) {
      console.error("Ageing error:", error);
    }
  };

  // INITIAL DATA LOAD
  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    loadTickets();
    loadStaffUsers();
    loadCategories();

    if (role === "Admin") {
      loadDashboard();
      loadAgeing();
    }
  }, [loggedIn, role]);

  // CREATE TICKET
  const handleCreateTicket = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!subject.trim()) {
      setErrorMessage("Please enter ticket subject.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Please enter ticket description.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/Tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: 1,
            categoryId: Number(categoryId),
            subject: subject.trim(),
            description: description.trim(),
            priority: priority,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const createdTicket = await response.json();

      setSubject("");
      setDescription("");
      setPriority("Medium");

      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }

      setSuccessMessage(
        `Ticket ${createdTicket.ticketNumber} created successfully!`
      );

      await loadTickets();

      if (role === "Admin") {
        await loadDashboard();
        await loadAgeing();
      }

      setCurrentView("my-tickets");
    } catch (error) {
      console.error("Create ticket error:", error);

      setErrorMessage(
        error.message || "Unable to create ticket."
      );
    }
  };
    // ASSIGN TICKET
  const handleAssignTicket = async (ticketId, staffId) => {
    if (!staffId) {
      setErrorMessage("Please select a staff member.");
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_URL}/Tickets/${ticketId}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            staffId: Number(staffId),
            assignedById: 3,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();

      setSuccessMessage(
        data.message || "Ticket assigned successfully."
      );

      await loadTickets();

      if (role === "Admin") {
        await loadDashboard();
        await loadAgeing();
      }

      if (
        selectedTicket &&
        selectedTicket.id === ticketId
      ) {
        await loadTicketDetails(ticketId);
      }
    } catch (error) {
      console.error("Assignment error:", error);

      setErrorMessage(
        error.message || "Unable to assign ticket."
      );
    }
  };

  // CHANGE STATUS
  const handleStatusChange = async (
    ticketId,
    newStatus
  ) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_URL}/Tickets/${ticketId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newStatus),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setSuccessMessage(
        "Ticket status updated successfully."
      );

      await loadTickets();

      if (role === "Admin") {
        await loadDashboard();
        await loadAgeing();
      }

      if (
        selectedTicket &&
        selectedTicket.id === ticketId
      ) {
        await loadTicketDetails(ticketId);
      }
    } catch (error) {
      console.error("Status update error:", error);

      setErrorMessage(
        error.message || "Unable to update ticket status."
      );
    }
  };

  // CHECK SLA
  const handleCheckSla = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_URL}/Tickets/check-sla`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();

      setSuccessMessage(
        data.message ||
          `SLA check completed. ${
            data.escalatedCount || 0
          } ticket(s) escalated.`
      );

      await loadTickets();
      await loadDashboard();
      await loadAgeing();
    } catch (error) {
      console.error("SLA check error:", error);

      setErrorMessage(
        error.message || "Unable to check SLA."
      );
    }
  };
    // LOAD TICKET DETAILS
  const loadTicketDetails = async (ticketId) => {
    try {
      const ticketResponse = await fetch(
        `${API_URL}/Tickets/${ticketId}`
      );

      const commentsResponse = await fetch(
        `${API_URL}/TicketComments/ticket/${ticketId}`
      );

      const historyResponse = await fetch(
        `${API_URL}/Tickets/${ticketId}/history`
      );

      if (!ticketResponse.ok) {
        throw new Error("Failed to load ticket.");
      }

      const ticket = await ticketResponse.json();

      const comments = commentsResponse.ok
        ? await commentsResponse.json()
        : [];

      const history = historyResponse.ok
        ? await historyResponse.json()
        : [];

      setSelectedTicket(ticket);
      setTicketComments(comments);
      setTicketHistory(history);
    } catch (error) {
      console.error(
        "Ticket details error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load ticket details."
      );
    }
  };

  // ADD COMMENT
  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!selectedTicket) {
      return;
    }

    if (!newComment.trim()) {
      setErrorMessage("Please enter a comment.");
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_URL}/TicketComments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticketId: selectedTicket.id,
            userId:
              role === "Student"
                ? 1
                : role === "Staff"
                ? 2
                : 3,
            commentText: newComment.trim(),
            isInternal: false,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setNewComment("");
      setSuccessMessage("Comment added successfully.");

      await loadTicketDetails(selectedTicket.id);
    } catch (error) {
      console.error(
        "Comment error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to add comment."
      );
    }
  };
    // LOGOUT
  const handleLogout = () => {
    setRole("");
    setLoggedIn(false);
    setCurrentView("dashboard");

    setTickets([]);
    setStaffUsers([]);
    setCategories([]);

    setDashboardData(null);
    setAgeingTickets([]);

    setSubject("");
    setDescription("");
    setCategoryId(1);
    setPriority("Medium");

    setSuccessMessage("");
    setErrorMessage("");

    setSelectedTicket(null);
    setTicketComments([]);
    setTicketHistory([]);
    setNewComment("");
  };

  // HELPERS
  const getCategoryName = (categoryIdValue) => {
    const category = categories.find(
      (item) => item.id === categoryIdValue
    );

    return category
      ? category.name
      : "Unknown";
  };

  const getStaffName = (staffIdValue) => {
    const staff = staffUsers.find(
      (user) => user.id === staffIdValue
    );

    return staff
      ? staff.name
      : "Unassigned";
  };

  const getUserName = (userId) => {
    if (userId === 1) {
      return "Student Demo";
    }

    if (userId === 2) {
      return "Support Staff";
    }

    if (userId === 3) {
      return "Admin Manager";
    }

    return "Unknown User";
  };

  // COMMON MESSAGES
  const Messages = () => (
    <>
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
    </>
  );
    // DASHBOARD HEADER
  const DashboardHeader = ({
    title,
    subtitle,
  }) => {
    return (
      <div className="dashboard-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    );
  };

  // DASHBOARD CARD
  const DashboardCard = ({
    title,
    value,
    description,
    onClick,
  }) => {
    return (
      <button
        type="button"
        className="dashboard-card"
        onClick={onClick}
      >
        <div className="dashboard-card-title">
          {title}
        </div>

        <div className="dashboard-card-value">
          {value}
        </div>

        {description && (
          <div className="dashboard-card-description">
            {description}
          </div>
        )}
      </button>
    );
  };

  // BACK BUTTON
  const BackButton = ({ onClick }) => {
    return (
      <button
        type="button"
        className="back-button"
        onClick={onClick}
      >
        ← Back
      </button>
    );
  };

  // SECTION HEADING
  const SectionHeading = ({
    title,
    description,
  }) => {
    return (
      <div className="section-heading">
        <h2>{title}</h2>

        {description && (
          <p>{description}</p>
        )}
      </div>
    );
  };
    // TICKET CARD
  const TicketCard = ({ ticket }) => {
    return (
      <div className="ticket-card">
        <div className="ticket-card-header">
          <div>
            <h3>
              {ticket.ticketNumber ||
                `Ticket #${ticket.id}`}
            </h3>

            <p className="ticket-subject">
              {ticket.subject}
            </p>
          </div>

          <span className="ticket-status">
            {ticket.status}
          </span>
        </div>

        <div className="ticket-card-info">
          <p>
            <strong>Category:</strong>{" "}
            {getCategoryName(ticket.categoryId)}
          </p>

          <p>
            <strong>Priority:</strong>{" "}
            {ticket.priority}
          </p>

          <p>
            <strong>Assigned To:</strong>{" "}
            {ticket.assignedStaffId
              ? getStaffName(ticket.assignedStaffId)
              : "Unassigned"}
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            loadTicketDetails(ticket.id)
          }
        >
          View Details
        </button>
      </div>
    );
  };

  // TICKET LIST
  const TicketList = ({
    ticketList,
    emptyMessage = "No tickets found.",
  }) => {
    if (!ticketList || ticketList.length === 0) {
      return (
        <div className="empty-state">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="ticket-list">
        {ticketList.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
          />
        ))}
      </div>
    );
  };
    // TICKET DETAILS MODAL
  const renderTicketModal = () => {
    if (!selectedTicket) {
      return null;
    }

    return (
      <div className="modal-overlay">
        <div className="ticket-modal">
          <div className="modal-header">
            <div>
              <h2>
                {selectedTicket.ticketNumber ||
                  `Ticket #${selectedTicket.id}`}
              </h2>

              <p>{selectedTicket.subject}</p>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={() =>
                setSelectedTicket(null)
              }
            >
              ×
            </button>
          </div>

          <div className="modal-section">
            <h3>Ticket Information</h3>

            <p>
              <strong>Description:</strong>{" "}
              {selectedTicket.description}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {getCategoryName(
                selectedTicket.categoryId
              )}
            </p>

            <p>
              <strong>Priority:</strong>{" "}
              {selectedTicket.priority}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {selectedTicket.status}
            </p>

            <p>
              <strong>Created By:</strong>{" "}
              {getUserName(
                selectedTicket.studentId
              )}
            </p>
          </div>

          <div className="modal-section">
            <h3>Comments</h3>

            {ticketComments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              <div className="comments-list">
                {ticketComments.map(
                  (comment) => (
                    <div
                      className="comment-item"
                      key={comment.id}
                    >
                      <strong>
                        {getUserName(
                          comment.userId
                        )}
                      </strong>

                      <p>
                        {comment.commentText}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            <form
              onSubmit={handleAddComment}
              className="comment-form"
            >
              <textarea
                value={newComment}
                onChange={(event) =>
                  setNewComment(
                    event.target.value
                  )
                }
                placeholder="Write a comment..."
                rows="4"
              />

              <button
                type="submit"
                className="primary-button"
              >
                Add Comment
              </button>
            </form>
          </div>

          <div className="modal-section">
            <h3>Activity History</h3>

            {ticketHistory.length === 0 ? (
              <p>No activity history.</p>
            ) : (
              <div className="history-list">
                {ticketHistory.map(
                  (history) => (
                    <div
                      className="history-item"
                      key={history.id}
                    >
                      <p>
                        {history.action ||
                          history.actionType ||
                          "Ticket updated"}
                      </p>

                      {history.createdAt && (
                        <small>
                          {new Date(
                            history.createdAt
                          ).toLocaleString()}
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
    // LOGIN SCREEN
  if (!loggedIn) {
    return (
      <div className="app-container">
        <div className="login-card">
          <h1>EduSupport</h1>

          <p>
            Student Support & Ticket Management
            System
          </p>

          <div className="role-buttons">
            <button
              type="button"
              onClick={() => {
                setRole("Student");
                setLoggedIn(true);
                setCurrentView("dashboard");
              }}
            >
              Login as Student
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("Staff");
                setLoggedIn(true);
                setCurrentView("dashboard");
              }}
            >
              Login as Staff
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("Admin");
                setLoggedIn(true);
                setCurrentView("dashboard");
              }}
            >
              Login as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // STUDENT DASHBOARD
  // =====================================================

  if (role === "Student") {
    const studentTickets = tickets.filter(
      (ticket) => ticket.studentId === 1
    );

    const pendingTickets =
      studentTickets.filter(
        (ticket) =>
          ticket.status !== "Resolved" &&
          ticket.status !== "Closed"
      );

    const resolvedTickets =
      studentTickets.filter(
        (ticket) =>
          ticket.status === "Resolved" ||
          ticket.status === "Closed"
      );

    const recentTickets = [
      ...studentTickets,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);

    return (
      <div className="app-container">
        <DashboardHeader
          title="Student Dashboard"
          subtitle="Manage your support tickets"
        />

        <Messages />

        {currentView === "dashboard" && (
          <>
            <div className="dashboard-grid">
              <DashboardCard
                title="My Tickets"
                value={studentTickets.length}
                description="View all your tickets"
                onClick={() =>
                  setCurrentView("my-tickets")
                }
              />

              <DashboardCard
                title="Pending"
                value={pendingTickets.length}
                description="Tickets awaiting resolution"
                onClick={() =>
                  setCurrentView("pending")
                }
              />

              <DashboardCard
                title="Resolved"
                value={resolvedTickets.length}
                description="Completed tickets"
                onClick={() =>
                  setCurrentView("resolved")
                }
              />

              <DashboardCard
                title="Create Ticket"
                value="+"
                description="Raise a new support request"
                onClick={() =>
                  setCurrentView("create-ticket")
                }
              />
            </div>

            <SectionHeading
              title="Recent Tickets"
              description="Your latest support requests"
            />

            <TicketList
              ticketList={recentTickets}
              emptyMessage="You have not created any tickets yet."
            />
          </>
        )}
                {currentView === "create-ticket" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Create New Ticket"
              description="Submit your support request"
            />

            <form
              className="ticket-form"
              onSubmit={handleCreateTicket}
            >
              <div className="form-group">
                <label htmlFor="subject">
                  Subject
                </label>

                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(event) =>
                    setSubject(event.target.value)
                  }
                  placeholder="Enter ticket subject"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Category
                </label>

                <select
                  id="category"
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(
                      Number(event.target.value)
                    )
                  }
                >
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value)
                  }
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                  <option value="Urgent">
                    Urgent
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe your issue"
                  rows="6"
                />
              </div>

              <button
                type="submit"
                className="primary-button"
              >
                Create Ticket
              </button>
            </form>
          </>
        )}

        {currentView === "my-tickets" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="My Tickets"
              description="All tickets created by you"
            />

            <TicketList
              ticketList={studentTickets}
              emptyMessage="No tickets found."
            />
          </>
        )}

        {currentView === "pending" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Pending Tickets"
              description="Tickets still being processed"
            />

            <TicketList
              ticketList={pendingTickets}
              emptyMessage="No pending tickets."
            />
          </>
        )}

        {currentView === "resolved" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Resolved Tickets"
              description="Your completed tickets"
            />

            <TicketList
              ticketList={resolvedTickets}
              emptyMessage="No resolved tickets."
            />
          </>
        )}
                {currentView === "recent" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Recent Tickets"
              description="Your latest support requests"
            />

            <TicketList
              ticketList={recentTickets}
              emptyMessage="No recent tickets."
            />
          </>
        )}

        {renderTicketModal()}
      </div>
    );
  }

  // =====================================================
  // STAFF DASHBOARD
  // =====================================================

  if (role === "Staff") {
    const assignedTickets = tickets.filter(
      (ticket) =>
        ticket.assignedStaffId === 2
    );

    const pendingTickets =
      tickets.filter(
        (ticket) =>
          ticket.status !== "Resolved" &&
          ticket.status !== "Closed"
      );

    const resolvedTickets =
      tickets.filter(
        (ticket) =>
          ticket.status === "Resolved" ||
          ticket.status === "Closed"
      );

    const escalatedTickets =
      tickets.filter(
        (ticket) =>
          ticket.isEscalated === true
      );

    const recentTickets = [
      ...tickets,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);

    return (
      <div className="app-container">
        <DashboardHeader
          title="Staff Dashboard"
          subtitle="Manage and resolve student tickets"
        />

        <Messages />

        {currentView === "dashboard" && (
          <>
            <div className="dashboard-grid">
              <DashboardCard
                title="All Tickets"
                value={tickets.length}
                description="View all support tickets"
                onClick={() =>
                  setCurrentView("all-tickets")
                }
              />

              <DashboardCard
                title="Assigned"
                value={assignedTickets.length}
                description="Tickets assigned to you"
                onClick={() =>
                  setCurrentView("assigned")
                }
              />

              <DashboardCard
                title="Pending"
                value={pendingTickets.length}
                description="Tickets awaiting resolution"
                onClick={() =>
                  setCurrentView("pending")
                }
              />

              <DashboardCard
                title="Escalated"
                value={escalatedTickets.length}
                description="Tickets requiring attention"
                onClick={() =>
                  setCurrentView("escalated")
                }
              />
            </div>

            <SectionHeading
              title="Recent Tickets"
              description="Latest tickets in the system"
            />

            <TicketList
              ticketList={recentTickets}
              emptyMessage="No tickets found."
            />
          </>
        )}
                {currentView === "all-tickets" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="All Tickets"
              description="All student support tickets"
            />

            <TicketList
              ticketList={tickets}
              emptyMessage="No tickets found."
            />
          </>
        )}

        {currentView === "assigned" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Assigned Tickets"
              description="Tickets currently assigned to you"
            />

            <TicketList
              ticketList={assignedTickets}
              emptyMessage="No tickets assigned to you."
            />
          </>
        )}

        {currentView === "pending" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Pending Tickets"
              description="Tickets still being processed"
            />

            <TicketList
              ticketList={pendingTickets}
              emptyMessage="No pending tickets."
            />
          </>
        )}

        {currentView === "escalated" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Escalated Tickets"
              description="Tickets that need immediate attention"
            />

            <TicketList
              ticketList={escalatedTickets}
              emptyMessage="No escalated tickets."
            />
          </>
        )}

        {currentView === "resolved" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Resolved Tickets"
              description="Completed support tickets"
            />

            <TicketList
              ticketList={resolvedTickets}
              emptyMessage="No resolved tickets."
            />
          </>
        )}

        {currentView === "recent" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Recent Tickets"
              description="Latest support requests"
            />

            <TicketList
              ticketList={recentTickets}
              emptyMessage="No recent tickets."
            />
          </>
        )}

        {renderTicketModal()}
      </div>
    );
  }
    // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  if (role === "Admin") {
    const openTickets = tickets.filter(
      (ticket) =>
        ticket.status !== "Resolved" &&
        ticket.status !== "Closed"
    );

    const resolvedTickets = tickets.filter(
      (ticket) =>
        ticket.status === "Resolved" ||
        ticket.status === "Closed"
    );

    const escalatedTickets = tickets.filter(
      (ticket) =>
        ticket.isEscalated === true
    );

    const recentTickets = [
      ...tickets,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);

    return (
      <div className="app-container">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="Monitor the support system"
        />

        <Messages />

        {currentView === "dashboard" && (
          <>
            <div className="dashboard-grid">
              <DashboardCard
                title="Total Tickets"
                value={tickets.length}
                description="All tickets in the system"
                onClick={() =>
                  setCurrentView("overview")
                }
              />

              <DashboardCard
                title="Open Tickets"
                value={openTickets.length}
                description="Tickets awaiting resolution"
                onClick={() =>
                  setCurrentView("monitoring")
                }
              />

              <DashboardCard
                title="Escalated"
                value={escalatedTickets.length}
                description="Tickets exceeding SLA"
                onClick={() =>
                  setCurrentView("escalated")
                }
              />

              <DashboardCard
                title="Resolved"
                value={resolvedTickets.length}
                description="Completed tickets"
                onClick={() =>
                  setCurrentView("overview")
                }
              />
            </div>

            <SectionHeading
              title="Recent Tickets"
              description="Latest activity in the system"
            />

            <TicketList
              ticketList={recentTickets}
              emptyMessage="No tickets found."
            />
          </>
        )}

        {currentView === "overview" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="System Overview"
              description="Overall ticket statistics"
            />

            <div className="dashboard-grid">
              <DashboardCard
                title="Total"
                value={tickets.length}
                description="Total tickets"
              />

              <DashboardCard
                title="Open"
                value={openTickets.length}
                description="Currently open"
              />

              <DashboardCard
                title="Resolved"
                value={resolvedTickets.length}
                description="Successfully resolved"
              />

              <DashboardCard
                title="Escalated"
                value={escalatedTickets.length}
                description="SLA escalations"
              />
            </div>

            <TicketList
              ticketList={tickets}
              emptyMessage="No tickets found."
            />
          </>
        )}
                {currentView === "monitoring" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Ticket Monitoring"
              description="Monitor all active tickets"
            />

            <TicketList
              ticketList={openTickets}
              emptyMessage="No open tickets."
            />
          </>
        )}

        {currentView === "sla" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="SLA Monitoring"
              description="Monitor tickets against SLA"
            />

            <button
              type="button"
              className="primary-button"
              onClick={handleCheckSla}
            >
              Check SLA
            </button>

            <div className="ticket-list">
              {ageingTickets.length === 0 ? (
                <div className="empty-state">
                  No ageing tickets found.
                </div>
              ) : (
                ageingTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                  />
                ))
              )}
            </div>
          </>
        )}

        {currentView === "workload" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Staff Workload"
              description="View assigned ticket workload"
            />

            <div className="ticket-list">
              {staffUsers.length === 0 ? (
                <div className="empty-state">
                  No staff members found.
                </div>
              ) : (
                staffUsers.map((staff) => {
                  const count = tickets.filter(
                    (ticket) =>
                      ticket.assignedStaffId ===
                      staff.id
                  ).length;

                  return (
                    <div
                      className="ticket-card"
                      key={staff.id}
                    >
                      <h3>{staff.name}</h3>

                      <p>
                        Assigned Tickets:{" "}
                        <strong>{count}</strong>
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {currentView === "categories" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Categories"
              description="Support ticket categories"
            />

            <div className="ticket-list">
              {categories.length === 0 ? (
                <div className="empty-state">
                  No categories found.
                </div>
              ) : (
                categories.map((category) => (
                  <div
                    className="ticket-card"
                    key={category.id}
                  >
                    <h3>{category.name}</h3>

                    <p>
                      SLA:{" "}
                      {category.slaHours} hours
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
                {currentView === "escalated" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Escalated Tickets"
              description="Tickets requiring immediate attention"
            />

            <TicketList
              ticketList={escalatedTickets}
              emptyMessage="No escalated tickets."
            />
          </>
        )}

        {currentView === "recent" && (
          <>
            <BackButton
              onClick={() =>
                setCurrentView("dashboard")
              }
            />

            <SectionHeading
              title="Recent Tickets"
              description="Latest tickets in the system"
            />

            <TicketList
              ticketList={recentTickets}
              emptyMessage="No recent tickets."
            />
          </>
        )}

        {renderTicketModal()}
      </div>
    );
  }

  // FALLBACK
  return null;
}

export default App;