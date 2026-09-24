using EduSupport.Api.Models;

namespace EduSupport.Api.Data
{
    public static class DbInitializer
    {
        public static void Seed(AppDbContext context)
        {
            if (!context.Users.Any())
            {
                context.Users.AddRange(
                    new User
                    {
                        Name = "Student Demo",
                        Email = "student@edusupport.com",
                        Role = "Student",
                        Department = "CSE",
                        IsActive = true
                    },
                    new User
                    {
                        Name = "Support Staff",
                        Email = "staff@edusupport.com",
                        Role = "Staff",
                        Department = "Administration",
                        IsActive = true
                    },
                    new User
                    {
                        Name = "Admin Manager",
                        Email = "admin@edusupport.com",
                        Role = "Admin",
                        Department = "Administration",
                        IsActive = true
                    }
                );

                context.SaveChanges();
            }

            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category
                    {
                        Name = "Fees",
                        DefaultSlaHours = 48,
                        IsActive = true
                    },
                    new Category
                    {
                        Name = "Attendance",
                        DefaultSlaHours = 24,
                        IsActive = true
                    },
                    new Category
                    {
                        Name = "ID Card",
                        DefaultSlaHours = 24,
                        IsActive = true
                    },
                    new Category
                    {
                        Name = "Documents",
                        DefaultSlaHours = 72,
                        IsActive = true
                    },
                    new Category
                    {
                        Name = "Certificate",
                        DefaultSlaHours = 48,
                        IsActive = true
                    },
                    new Category
                    {
                        Name = "Other",
                        DefaultSlaHours = 72,
                        IsActive = true
                    }
                );

                context.SaveChanges();
            }
        }
    }
}
