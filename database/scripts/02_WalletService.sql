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
CREATE TABLE [Wallets] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [TotalBalance] decimal(18,2) NOT NULL,
    [AvailableBalance] decimal(18,2) NOT NULL,
    [HeldBalance] decimal(18,2) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_Wallets] PRIMARY KEY ([Id])
);

CREATE TABLE [WalletTransactions] (
    [Id] uniqueidentifier NOT NULL,
    [WalletId] uniqueidentifier NOT NULL,
    [Type] nvarchar(max) NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [RelatedAuctionId] uniqueidentifier NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_WalletTransactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WalletTransactions_Wallets_WalletId] FOREIGN KEY ([WalletId]) REFERENCES [Wallets] ([Id]) ON DELETE CASCADE
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AvailableBalance', N'CreatedAt', N'HeldBalance', N'TotalBalance', N'UpdatedAt', N'UserId') AND [object_id] = OBJECT_ID(N'[Wallets]'))
    SET IDENTITY_INSERT [Wallets] ON;
INSERT INTO [Wallets] ([Id], [AvailableBalance], [CreatedAt], [HeldBalance], [TotalBalance], [UpdatedAt], [UserId])
INSERT INTO [Wallets] ([Id], [AvailableBalance], [CreatedAt], [HeldBalance], [TotalBalance], [UpdatedAt], [UserId])
VALUES ('00000000-0000-0000-0000-000000000100', 5000000.0, '2026-01-01T00:00:00.0000000Z', 0.0, 5000000.0, '2026-01-01T00:00:00.0000000Z', '00000000-0000-0000-0000-000000000040'),
('00000000-0000-0000-0000-000000000200', 4955000.0, '2026-01-01T00:00:00.0000000Z', 45000.0, 5000000.0, '2026-01-01T00:00:00.0000000Z', '00000000-0000-0000-0000-000000000010'),
('00000000-0000-0000-0000-000000000300', 5000000.0, '2026-01-01T00:00:00.0000000Z', 0.0, 5000000.0, '2026-01-01T00:00:00.0000000Z', '00000000-0000-0000-0000-000000000020'),
('00000000-0000-0000-0000-000000000400', 0.0, '2026-01-01T00:00:00.0000000Z', 0.0, 0.0, '2026-01-01T00:00:00.0000000Z', '00000000-0000-0000-0000-000000000030');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AvailableBalance', N'CreatedAt', N'HeldBalance', N'TotalBalance', N'UpdatedAt', N'UserId') AND [object_id] = OBJECT_ID(N'[Wallets]'))
    SET IDENTITY_INSERT [Wallets] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Amount', N'CreatedAt', N'Description', N'RelatedAuctionId', N'Status', N'Type', N'WalletId') AND [object_id] = OBJECT_ID(N'[WalletTransactions]'))
    SET IDENTITY_INSERT [WalletTransactions] ON;
INSERT INTO [WalletTransactions] ([Id], [Amount], [CreatedAt], [Description], [RelatedAuctionId], [Status], [Type], [WalletId])
VALUES ('00000000-0000-0000-0000-000000000901', 150000.0, '2026-01-01T00:00:00.0000000Z', N'Depósito inicial de saldo', NULL, N'Completed', N'Deposit', '00000000-0000-0000-0000-000000000200'),
('00000000-0000-0000-0000-000000000902', 45000.0, '2026-01-01T01:00:00.0000000Z', N'Retención de puja en subasta activa MacBook Pro M3', '00000000-0000-0000-0000-000000000011', N'Completed', N'Hold', '00000000-0000-0000-0000-000000000200'),
('00000000-0000-0000-0000-000000000903', 200000.0, '2026-01-01T00:00:00.0000000Z', N'Depósito inicial de saldo', NULL, N'Completed', N'Deposit', '00000000-0000-0000-0000-000000000300'),
('00000000-0000-0000-0000-000000000904', 500.0, '2026-01-01T00:00:00.0000000Z', N'Depósito inicial de prueba de saldo insuficiente', NULL, N'Completed', N'Deposit', '00000000-0000-0000-0000-000000000400');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Amount', N'CreatedAt', N'Description', N'RelatedAuctionId', N'Status', N'Type', N'WalletId') AND [object_id] = OBJECT_ID(N'[WalletTransactions]'))
    SET IDENTITY_INSERT [WalletTransactions] OFF;

CREATE UNIQUE INDEX [IX_Wallets_UserId] ON [Wallets] ([UserId]);

CREATE INDEX [IX_WalletTransactions_WalletId] ON [WalletTransactions] ([WalletId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260907192041_InitialCreate', N'9.0.2');

COMMIT;
GO

