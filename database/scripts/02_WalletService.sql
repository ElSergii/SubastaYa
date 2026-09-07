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
VALUES ('10000000-0000-0000-0000-000000000001', 0.0, '2026-01-01T00:00:00.0000000Z', 0.0, 0.0, '2026-01-01T00:00:00.0000000Z', '11111111-1111-1111-1111-111111111111'),
('20000000-0000-0000-0000-000000000002', 105000.0, '2026-01-01T00:00:00.0000000Z', 45000.0, 150000.0, '2026-01-01T00:00:00.0000000Z', '22222222-2222-2222-2222-222222222222'),
('30000000-0000-0000-0000-000000000003', 200000.0, '2026-01-01T00:00:00.0000000Z', 0.0, 200000.0, '2026-01-01T00:00:00.0000000Z', '33333333-3333-3333-3333-333333333333'),
('40000000-0000-0000-0000-000000000004', 500.0, '2026-01-01T00:00:00.0000000Z', 0.0, 500.0, '2026-01-01T00:00:00.0000000Z', '44444444-4444-4444-4444-444444444444');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AvailableBalance', N'CreatedAt', N'HeldBalance', N'TotalBalance', N'UpdatedAt', N'UserId') AND [object_id] = OBJECT_ID(N'[Wallets]'))
    SET IDENTITY_INSERT [Wallets] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Amount', N'CreatedAt', N'Description', N'RelatedAuctionId', N'Status', N'Type', N'WalletId') AND [object_id] = OBJECT_ID(N'[WalletTransactions]'))
    SET IDENTITY_INSERT [WalletTransactions] ON;
INSERT INTO [WalletTransactions] ([Id], [Amount], [CreatedAt], [Description], [RelatedAuctionId], [Status], [Type], [WalletId])
VALUES ('90000000-0000-0000-0000-000000000001', 150000.0, '2026-01-01T00:00:00.0000000Z', N'Depósito inicial de saldo', NULL, N'Completed', N'Deposit', '20000000-0000-0000-0000-000000000002'),
('90000000-0000-0000-0000-000000000002', 45000.0, '2026-01-01T01:00:00.0000000Z', N'Retención de puja en subasta activa MacBook Pro M3', 'a1111111-1111-1111-1111-111111111111', N'Completed', N'Hold', '20000000-0000-0000-0000-000000000002'),
('90000000-0000-0000-0000-000000000003', 200000.0, '2026-01-01T00:00:00.0000000Z', N'Depósito inicial de saldo', NULL, N'Completed', N'Deposit', '30000000-0000-0000-0000-000000000003'),
('90000000-0000-0000-0000-000000000004', 500.0, '2026-01-01T00:00:00.0000000Z', N'Depósito inicial de prueba de saldo insuficiente', NULL, N'Completed', N'Deposit', '40000000-0000-0000-0000-000000000004');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Amount', N'CreatedAt', N'Description', N'RelatedAuctionId', N'Status', N'Type', N'WalletId') AND [object_id] = OBJECT_ID(N'[WalletTransactions]'))
    SET IDENTITY_INSERT [WalletTransactions] OFF;

CREATE UNIQUE INDEX [IX_Wallets_UserId] ON [Wallets] ([UserId]);

CREATE INDEX [IX_WalletTransactions_WalletId] ON [WalletTransactions] ([WalletId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260907192041_InitialCreate', N'9.0.2');

COMMIT;
GO

