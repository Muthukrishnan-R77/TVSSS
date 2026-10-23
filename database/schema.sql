-- ====================================================================
-- TVS Sensing Solutions — MS SQL Server Database Schema
-- ====================================================================

-- 1. Admin Users Table
IF OBJECT_ID(N'dbo.AdminUsers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AdminUsers (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Email NVARCHAR(150) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        LastLoginAt DATETIME2 NULL
    );
END;

-- 2. Media Table
IF OBJECT_ID(N'dbo.Media', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Media (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(250) NOT NULL,
        ShortDescription NVARCHAR(1000) NULL,
        MediaType NVARCHAR(50) NOT NULL DEFAULT 'Image',
        FileName NVARCHAR(255) NULL,
        FilePath NVARCHAR(500) NULL,
        ThumbnailPath NVARCHAR(500) NULL,
        ExternalLink NVARCHAR(500) NULL,
        PublishDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        Status NVARCHAR(50) NOT NULL DEFAULT 'Published',
        IsPublished BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CreatedBy NVARCHAR(100) NULL
    );
END;

-- 3. Career Job Openings Table
IF OBJECT_ID(N'dbo.CareerJobs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CareerJobs (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        JobTitle NVARCHAR(200) NOT NULL,
        Department NVARCHAR(100) NULL,
        Location NVARCHAR(100) NOT NULL DEFAULT N'Madurai, Tamil Nadu',
        EmploymentType NVARCHAR(50) NOT NULL DEFAULT N'Full Time',
        JobDescription NVARCHAR(MAX) NOT NULL,
        Eligibility NVARCHAR(MAX) NULL,
        RequiredSkills NVARCHAR(MAX) NULL,
        Responsibilities NVARCHAR(MAX) NULL,
        ExperienceRequired NVARCHAR(MAX) NULL,
        NumberOfVacancies INT NOT NULL DEFAULT 1,
        SalaryInformation NVARCHAR(100) NULL,
        ClosingDate DATETIME2 NULL,
        ApplicationDeadline DATETIME2 NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Active',
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CreatedBy NVARCHAR(100) NULL
    );
END;

-- 4. Career Applications Table (STRICT SEPARATION: Career applications belong ONLY here)
IF OBJECT_ID(N'dbo.CareerApplications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CareerApplications (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        JobId INT NULL FOREIGN KEY REFERENCES dbo.CareerJobs(Id) ON DELETE SET NULL,
        ApplicantName NVARCHAR(150) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        Phone NVARCHAR(30) NULL,
        CurrentLocation NVARCHAR(100) NULL,
        Qualification NVARCHAR(200) NULL,
        Experience NVARCHAR(100) NULL,
        CoverLetter NVARCHAR(MAX) NULL,
        ResumeFileName NVARCHAR(255) NULL,
        ResumeFilePath NVARCHAR(500) NULL,
        ApplicationStatus NVARCHAR(50) NOT NULL DEFAULT 'New',
        AdminRemarks NVARCHAR(MAX) NULL,
        SubmittedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;

-- 5. Enquiries Table (STRICT SEPARATION: Only Reach Us submissions belong here)
IF OBJECT_ID(N'dbo.Enquiries', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Enquiries (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EnquiryNumber NVARCHAR(50) NULL,
        Name NVARCHAR(150) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        Phone NVARCHAR(30) NULL,
        Company NVARCHAR(150) NULL,
        Subject NVARCHAR(250) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        EnquiryStatus NVARCHAR(50) NOT NULL DEFAULT 'New',
        AdminRemarks NVARCHAR(MAX) NULL,
        SubmittedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;
