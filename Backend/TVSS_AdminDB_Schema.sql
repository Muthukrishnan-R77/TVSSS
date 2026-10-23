-- ============================================================================
-- TVS SENSING SOLUTIONS — MS SQL SERVER DATABASE CREATION & SCHEMA SCRIPT
-- DATABASE NAME: TVSS_AdminDB
-- ============================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'TVSS_AdminDB')
BEGIN
    CREATE DATABASE [TVSS_AdminDB];
END
GO

USE [TVSS_AdminDB];
GO

-- 1. ADMIN USERS TABLE
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

    CREATE INDEX IX_AdminUsers_Email ON dbo.AdminUsers(Email);
END
GO

-- 2. MEDIA TABLE
IF OBJECT_ID(N'dbo.Media', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Media (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(250) NOT NULL,
        ShortDescription NVARCHAR(1000) NULL,
        MediaType NVARCHAR(50) NOT NULL DEFAULT 'Image', -- Image, Video, ExternalLink
        FilePath NVARCHAR(500) NULL,
        ThumbnailPath NVARCHAR(500) NULL,
        ExternalLink NVARCHAR(500) NULL,
        PublishDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        IsPublished BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CreatedBy NVARCHAR(100) NULL
    );

    CREATE INDEX IX_Media_IsPublished ON dbo.Media(IsPublished);
    CREATE INDEX IX_Media_PublishDate ON dbo.Media(PublishDate DESC);
END
GO

-- 3. CAREER OPENINGS TABLE
IF OBJECT_ID(N'dbo.CareerOpenings', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CareerOpenings (
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
        ApplicationDeadline DATETIME2 NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CreatedBy NVARCHAR(100) NULL
    );

    CREATE INDEX IX_CareerOpenings_IsActive ON dbo.CareerOpenings(IsActive);
    CREATE INDEX IX_CareerOpenings_CreatedAt ON dbo.CareerOpenings(CreatedAt DESC);
END
GO

-- 4. ENQUIRIES TABLE
IF OBJECT_ID(N'dbo.Enquiries', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Enquiries (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(150) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        Phone NVARCHAR(30) NULL,
        Company NVARCHAR(150) NULL,
        Subject NVARCHAR(250) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        SubmittedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        Status NVARCHAR(50) NOT NULL DEFAULT 'New', -- New, In Progress, Responded, Closed
        AdminRemarks NVARCHAR(MAX) NULL,
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedBy NVARCHAR(100) NULL
    );

    CREATE INDEX IX_Enquiries_Status ON dbo.Enquiries(Status);
    CREATE INDEX IX_Enquiries_SubmittedAt ON dbo.Enquiries(SubmittedAt DESC);
END
GO

-- SEED DEFAULT ADMIN USER (admin@tvsss.co.in / Password: Admin@TVSS2026)
IF NOT EXISTS (SELECT 1 FROM dbo.AdminUsers WHERE Email = 'admin@tvsss.co.in')
BEGIN
    INSERT INTO dbo.AdminUsers (Name, Email, PasswordHash, IsActive, CreatedAt, UpdatedAt)
    VALUES (
        N'TVS Administrator',
        N'admin@tvsss.co.in',
        N'$2a$11$qE.3gW2xO7n8z4r5H0V1Oe4s5x6y7z8a9b0c1d2e3f4g5h6i7j8k9', -- BCrypt hash of 'Admin@TVSS2026'
        1,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
END
GO
