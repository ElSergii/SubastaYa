IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Users] (
    [Id] uniqueidentifier NOT NULL,
    [Email] nvarchar(100) NOT NULL,
    [Username] nvarchar(50) NOT NULL,
    [FullName] nvarchar(100) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'FullName', N'Username') AND [object_id] = OBJECT_ID(N'[Users]'))
    SET IDENTITY_INSERT [Users] ON;
INSERT INTO [Users] ([Id], [CreatedAt], [Email], [FullName], [Username])
VALUES ('11111111-1111-1111-1111-111111111111', '2026-01-01T00:00:00.0000000Z', N'vendedor@test.com', N'Admin SubastaYa (Vendedor)', N'admin_vendedor'),
('22222222-2222-2222-2222-222222222222', '2026-01-01T00:00:00.0000000Z', N'comprador1@test.com', N'Ana García (Comprador 1)', N'comprador1'),
('33333333-3333-3333-3333-333333333333', '2026-01-01T00:00:00.0000000Z', N'comprador2@test.com', N'María López (Comprador 2)', N'comprador2'),
('44444444-4444-4444-4444-444444444444', '2026-01-01T00:00:00.0000000Z', N'sinfondos@test.com', N'Carlos Sin Fondos', N'sinfondos');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'FullName', N'Username') AND [object_id] = OBJECT_ID(N'[Users]'))
    SET IDENTITY_INSERT [Users] OFF;

CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);

CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260907192035_InitialCreate', N'9.0.2');

COMMIT;
GO

