using LMS.Core.Entities;
using LMS.Core.Enums;
using LMS.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LMS.API.Extensions;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        // SQLite: use EnsureCreated (no migrations). SQL Server: use Migrate.
        if (context.Database.IsSqlite())
            await context.Database.EnsureCreatedAsync();
        else
            await context.Database.MigrateAsync();

        if (await userManager.Users.AnyAsync()) return;

        // --- Users ---
        var admin = await CreateUser(userManager, "System", "Admin", "admin@lms.com", "Admin@123", UserRole.Admin);
        var lecturer1 = await CreateUser(userManager, "Jane", "Doe", "lecturer@lms.com", "Lecturer@123", UserRole.Lecturer);
        var lecturer2 = await CreateUser(userManager, "Mark", "Williams", "mark@lms.com", "Lecturer@123", UserRole.Lecturer);
        var student1 = await CreateUser(userManager, "John", "Smith", "student@lms.com", "Student@123", UserRole.Student);
        var student2 = await CreateUser(userManager, "Sipho", "Nkosi", "sipho@lms.com", "Student@123", UserRole.Student);
        var student3 = await CreateUser(userManager, "Ayanda", "Dlamini", "ayanda@lms.com", "Student@123", UserRole.Student);

        // --- Courses ---
        var cs101 = CreateCourse("Introduction to Computer Science", "Foundational programming concepts and problem solving.", "CS101", 15, lecturer1.Id);
        var cs201 = CreateCourse("Data Structures & Algorithms", "Arrays, linked lists, trees, graphs, sorting and searching.", "CS201", 20, lecturer1.Id);
        var web301 = CreateCourse("Web Development Fundamentals", "HTML, CSS, JavaScript and modern web frameworks.", "WEB301", 15, lecturer2.Id);
        var db201 = CreateCourse("Database Design", "Relational databases, SQL, normalisation and query optimisation.", "DB201", 20, lecturer2.Id);

        context.Courses.AddRange(cs101, cs201, web301, db201);

        // --- Modules ---
        var cs101Modules = new[]
        {
            CreateModule("Week 1 - Introduction to Programming", "What is programming and why it matters.", "# Welcome\nThis week we cover what programming is and why you should care.", 1, cs101.Id),
            CreateModule("Week 2 - Variables & Data Types", "Understanding how data is stored and manipulated.", "# Variables\nA variable is a named storage location in memory.", 2, cs101.Id),
            CreateModule("Week 3 - Control Flow", "If statements, loops and decision making in code.", "# Control Flow\nControl flow determines the order in which statements are executed.", 3, cs101.Id),
            CreateModule("Week 4 - Functions & Methods", "Breaking code into reusable, testable pieces.", "# Functions\nFunctions are the building blocks of reusable software.", 4, cs101.Id),
        };

        var cs201Modules = new[]
        {
            CreateModule("Arrays & Lists", "Linear data structures and their time complexity.", "# Arrays\nAn array is a fixed-size sequential collection of elements.", 1, cs201.Id),
            CreateModule("Linked Lists", "Nodes, pointers and dynamic memory.", "# Linked Lists\nA linked list is a sequence of nodes where each node points to the next.", 2, cs201.Id),
            CreateModule("Trees & Graphs", "Hierarchical and relational data structures.", "# Trees\nA tree is a hierarchical data structure with a root and subtrees.", 3, cs201.Id),
        };

        var web301Modules = new[]
        {
            CreateModule("HTML Fundamentals", "Structure and semantics of the web.", "# HTML\nHyperText Markup Language defines the structure of web pages.", 1, web301.Id),
            CreateModule("CSS & Styling", "Making the web look great.", "# CSS\nCascading Style Sheets control the visual presentation of web pages.", 2, web301.Id),
            CreateModule("JavaScript Basics", "Making pages interactive.", "# JavaScript\nJavaScript is the programming language of the web.", 3, web301.Id),
        };

        var db201Modules = new[]
        {
            CreateModule("Relational Model", "Tables, rows, columns and relationships.", "# Relational Databases\nData is stored in tables with defined relationships.", 1, db201.Id),
            CreateModule("SQL Fundamentals", "SELECT, INSERT, UPDATE, DELETE.", "# SQL\nStructured Query Language is used to interact with relational databases.", 2, db201.Id),
            CreateModule("Normalisation", "1NF, 2NF, 3NF and eliminating redundancy.", "# Normalisation\nNormalisation organises data to reduce redundancy and improve integrity.", 3, db201.Id),
        };

        context.Modules.AddRange(cs101Modules);
        context.Modules.AddRange(cs201Modules);
        context.Modules.AddRange(web301Modules);
        context.Modules.AddRange(db201Modules);

        // --- Assignments ---
        var assignments = new List<Assignment>
        {
            CreateAssignment("Hello World Program", "Write a Hello World program in a language of your choice and explain how it works.", 7, 100, cs101Modules[0].Id),
            CreateAssignment("Variable Types Quiz", "Create a program that demonstrates 5 different data types with examples.", 14, 50, cs101Modules[1].Id),
            CreateAssignment("FizzBuzz Challenge", "Implement FizzBuzz for numbers 1-100 using loops and conditionals.", 14, 100, cs101Modules[2].Id),
            CreateAssignment("Calculator Function", "Build a calculator with add, subtract, multiply, divide functions.", 21, 100, cs101Modules[3].Id),
            CreateAssignment("Array Sorting", "Implement bubble sort and compare it to built-in sorting. Analyse time complexity.", 10, 100, cs201Modules[0].Id),
            CreateAssignment("Linked List Implementation", "Build a singly linked list from scratch with insert, delete and search.", 14, 100, cs201Modules[1].Id),
            CreateAssignment("HTML Portfolio Page", "Create a personal portfolio page using semantic HTML only.", 7, 100, web301Modules[0].Id),
            CreateAssignment("Styled Portfolio", "Add CSS styling to your portfolio — responsive layout required.", 14, 100, web301Modules[1].Id),
            CreateAssignment("ER Diagram", "Design an ER diagram for a library management system.", 10, 80, db201Modules[0].Id),
            CreateAssignment("SQL Queries", "Write 10 SQL queries against the provided student database schema.", 14, 100, db201Modules[1].Id),
        };

        context.Assignments.AddRange(assignments);

        // --- Enrollments ---
        var enrollments = new[]
        {
            CreateEnrollment(student1.Id, cs101.Id),
            CreateEnrollment(student1.Id, cs201.Id),
            CreateEnrollment(student1.Id, web301.Id),
            CreateEnrollment(student2.Id, cs101.Id),
            CreateEnrollment(student2.Id, web301.Id),
            CreateEnrollment(student2.Id, db201.Id),
            CreateEnrollment(student3.Id, cs101.Id),
            CreateEnrollment(student3.Id, db201.Id),
        };

        context.Enrollments.AddRange(enrollments);

        // --- Announcements ---
        var announcements = new[]
        {
            CreateAnnouncement("Welcome to CS101!", "Welcome everyone. Please review the course outline and join the discussion forum.", cs101.Id, lecturer1.Id),
            CreateAnnouncement("Week 1 Materials Posted", "Slides and reading material for Week 1 are now available in the module section.", cs101.Id, lecturer1.Id),
            CreateAnnouncement("Assignment 1 Due Friday", "Reminder: your Hello World submission is due this Friday at midnight.", cs101.Id, lecturer1.Id),
            CreateAnnouncement("Welcome to Web Development!", "This course moves fast — make sure to practise code daily outside of class.", web301.Id, lecturer2.Id),
            CreateAnnouncement("Guest Lecturer Next Week", "We have a senior developer from a local tech company joining us next Tuesday.", web301.Id, lecturer2.Id),
        };

        context.Announcements.AddRange(announcements);

        await context.SaveChangesAsync();

        // --- Submissions & Grades (after save so IDs exist) ---
        var sub1 = CreateSubmission(assignments[0].Id, student1.Id, "uploads/john-hello-world.zip", "Used C# — added comments throughout.");
        var sub2 = CreateSubmission(assignments[0].Id, student2.Id, "uploads/sipho-hello-world.zip", "Used Python as it's what I'm most comfortable with.");
        var sub3 = CreateSubmission(assignments[0].Id, student3.Id, "uploads/ayanda-hello-world.zip", "JavaScript version with a simple web page.");
        var sub4 = CreateSubmission(assignments[6].Id, student2.Id, "uploads/sipho-html-portfolio.zip", "Included an about page and projects section.");

        context.Submissions.AddRange(sub1, sub2, sub3, sub4);
        await context.SaveChangesAsync();

        var grades = new[]
        {
            CreateGrade(sub1.Id, 88, "Excellent work John! Clean code and well commented. Minor: variable names could be more descriptive.", lecturer1.Id),
            CreateGrade(sub2.Id, 92, "Outstanding Sipho! Python is a great choice — your explanation was very clear.", lecturer1.Id),
            CreateGrade(sub4.Id, 75, "Good structure Sipho. Missing alt attributes on images and the layout breaks on mobile.", lecturer2.Id),
        };

        context.Grades.AddRange(grades);

        sub1.Status = SubmissionStatus.Graded;
        sub2.Status = SubmissionStatus.Graded;
        sub4.Status = SubmissionStatus.Graded;

        await context.SaveChangesAsync();
    }

    private static async Task<ApplicationUser> CreateUser(UserManager<ApplicationUser> um,
        string first, string last, string email, string password, UserRole role)
    {
        var user = new ApplicationUser
        {
            FirstName = first, LastName = last,
            Email = email, UserName = email, Role = role
        };
        await um.CreateAsync(user, password);
        return user;
    }

    private static Course CreateCourse(string title, string desc, string code, int credits, string lecturerId) => new()
    {
        Id = Guid.NewGuid(), Title = title, Description = desc,
        Code = code, Credits = credits, LecturerId = lecturerId
    };

    private static Module CreateModule(string title, string desc, string content, int order, Guid courseId) => new()
    {
        Id = Guid.NewGuid(), Title = title, Description = desc,
        Content = content, Order = order, CourseId = courseId
    };

    private static Assignment CreateAssignment(string title, string desc, int dueDays, decimal maxGrade, Guid moduleId) => new()
    {
        Id = Guid.NewGuid(), Title = title, Description = desc,
        DueDate = DateTime.UtcNow.AddDays(dueDays), MaxGrade = maxGrade, ModuleId = moduleId
    };

    private static Enrollment CreateEnrollment(string studentId, Guid courseId) => new()
    {
        Id = Guid.NewGuid(), StudentId = studentId, CourseId = courseId
    };

    private static Announcement CreateAnnouncement(string title, string content, Guid courseId, string authorId) => new()
    {
        Id = Guid.NewGuid(), Title = title, Content = content,
        CourseId = courseId, AuthorId = authorId
    };

    private static Submission CreateSubmission(Guid assignmentId, string studentId, string filePath, string notes) => new()
    {
        Id = Guid.NewGuid(), AssignmentId = assignmentId, StudentId = studentId,
        FilePath = filePath, Notes = notes, Status = SubmissionStatus.Submitted
    };

    private static Grade CreateGrade(Guid submissionId, decimal score, string feedback, string gradedById) => new()
    {
        Id = Guid.NewGuid(), SubmissionId = submissionId,
        Score = score, Feedback = feedback, GradedById = gradedById
    };
}
