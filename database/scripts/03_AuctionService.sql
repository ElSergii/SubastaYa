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
CREATE TABLE [AuditLogs] (
    [Id] uniqueidentifier NOT NULL,
    [EventType] nvarchar(100) NOT NULL,
    [EntityId] uniqueidentifier NULL,
    [EntityName] nvarchar(100) NOT NULL,
    [UserId] uniqueidentifier NULL,
    [Details] nvarchar(max) NOT NULL,
    [IpAddress] nvarchar(50) NOT NULL,
    [Timestamp] datetime2 NOT NULL,
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([Id])
);

CREATE TABLE [Categories] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(255) NOT NULL,
    [Icon] nvarchar(100) NOT NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
);

CREATE TABLE [Sales] (
    [Id] uniqueidentifier NOT NULL,
    [AuctionId] uniqueidentifier NOT NULL,
    [SellerId] uniqueidentifier NOT NULL,
    [BuyerId] uniqueidentifier NOT NULL,
    [FinalPrice] decimal(18,2) NOT NULL,
    [SaleDate] datetime2 NOT NULL,
    CONSTRAINT [PK_Sales] PRIMARY KEY ([Id])
);

CREATE TABLE [Auctions] (
    [Id] uniqueidentifier NOT NULL,
    [Title] nvarchar(150) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [ImageUrl] nvarchar(500) NOT NULL,
    [CategoryId] uniqueidentifier NOT NULL,
    [StartingPrice] decimal(18,2) NOT NULL,
    [CurrentPrice] decimal(18,2) NOT NULL,
    [MinimumIncrement] decimal(18,2) NOT NULL,
    [SellerId] uniqueidentifier NOT NULL,
    [WinnerId] uniqueidentifier NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [ExtendedUntil] datetime2 NULL,
    [Status] nvarchar(max) NOT NULL,
    [BidCount] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [RowVersion] rowversion NOT NULL,
    CONSTRAINT [PK_Auctions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Auctions_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Bids] (
    [Id] uniqueidentifier NOT NULL,
    [AuctionId] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [BidTime] datetime2 NOT NULL,
    [IsWinningBid] bit NOT NULL,
    CONSTRAINT [PK_Bids] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Bids_Auctions_AuctionId] FOREIGN KEY ([AuctionId]) REFERENCES [Auctions] ([Id]) ON DELETE CASCADE
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Description', N'Icon', N'Name') AND [object_id] = OBJECT_ID(N'[Categories]'))
    SET IDENTITY_INSERT [Categories] ON;
INSERT INTO [Categories] ([Id], [Description], [Icon], [Name])
VALUES ('c1111111-1111-1111-1111-111111111111', N'Laptops, Smartphones, Consolas y Gadgets', N'Computer', N'Tecnología'),
('c2222222-2222-2222-2222-222222222222', N'Arte, Antigüedades, Relojes y Rarezas', N'Diamond', N'Coleccionables'),
('c3333333-3333-3333-3333-333333333333', N'Ropa Vintage, Zapatillas y Accesorios de Lujo', N'Checkroom', N'Indumentaria'),
('c4444444-4444-4444-4444-444444444444', N'Autos, Motos, Scooters y Movilidad', N'DirectionsCar', N'Vehículos');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Description', N'Icon', N'Name') AND [object_id] = OBJECT_ID(N'[Categories]'))
    SET IDENTITY_INSERT [Categories] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BidCount', N'CategoryId', N'CreatedAt', N'CurrentPrice', N'Description', N'EndDate', N'ExtendedUntil', N'ImageUrl', N'MinimumIncrement', N'SellerId', N'StartDate', N'StartingPrice', N'Status', N'Title', N'WinnerId') AND [object_id] = OBJECT_ID(N'[Auctions]'))
    SET IDENTITY_INSERT [Auctions] ON;
INSERT INTO [Auctions] ([Id], [BidCount], [CategoryId], [CreatedAt], [CurrentPrice], [Description], [EndDate], [ExtendedUntil], [ImageUrl], [MinimumIncrement], [SellerId], [StartDate], [StartingPrice], [Status], [Title], [WinnerId])
VALUES ('a4444444-4444-4444-4444-444444444444', 4, 'c1111111-1111-1111-1111-111111111111', '2026-09-07T15:00:00.0000000Z', 45000.0, N'Computadora portátil profesional Apple M3 Max 36GB RAM en estado impecable.', '2026-09-09T18:00:00.0000000Z', NULL, N'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', 2000.0, '11111111-1111-1111-1111-111111111111', '2026-09-07T15:00:00.0000000Z', 30000.0, N'Active', N'MacBook Pro M3 Max 16 Pulgadas', '22222222-2222-2222-2222-222222222222'),
('a5555555-5555-5555-5555-555555555555', 5, 'c3333333-3333-3333-3333-333333333333', '2026-09-05T16:00:00.0000000Z', 28000.0, N'Chaqueta clásica de cuero vacuno talle M en excelente estado de conservación.', '2026-09-09T19:00:00.0000000Z', NULL, N'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', 1000.0, '11111111-1111-1111-1111-111111111111', '2026-09-05T16:00:00.0000000Z', 15000.0, N'Active', N'Chaqueta de Cuero Vintage Schott NYC', '33333333-3333-3333-3333-333333333333'),
('a6666666-6666-6666-6666-666666666666', 3, 'c2222222-2222-2222-2222-222222222222', '2026-09-07T14:00:00.0000000Z', 120000.0, N'Edición de colección con certificado de autenticidad y service reciente.', '2026-09-09T20:00:00.0000000Z', NULL, N'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', 5000.0, '11111111-1111-1111-1111-111111111111', '2026-09-07T14:00:00.0000000Z', 100000.0, N'Active', N'Reloj Rolex Submariner Date 1998 Original', '22222222-2222-2222-2222-222222222222'),
('a7777777-7777-7777-7777-777777777777', 2, 'c2222222-2222-2222-2222-222222222222', '2026-09-07T16:00:00.0000000Z', 85000.0, N'Instrumento de gama alta con estuche rígido Custom Shop.', '2026-09-09T21:00:00.0000000Z', NULL, N'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80', 2500.0, '11111111-1111-1111-1111-111111111111', '2026-09-08T16:00:00.0000000Z', 80000.0, N'Active', N'Guitarra Gibson Les Paul Standard 1959', '33333333-3333-3333-3333-333333333333'),
('a8888888-8888-8888-8888-888888888888', 1, 'c4444444-4444-4444-4444-444444444444', '2026-09-04T16:00:00.0000000Z', 55000.0, N'Scooter urbano 45km autonomía con freno de disco y pantalla digital.', '2026-09-09T22:00:00.0000000Z', NULL, N'https://images.unsplash.com/photo-1597086884617-64b58e72efcb?auto=format&fit=crop&w=800&q=80', 2000.0, '11111111-1111-1111-1111-111111111111', '2026-09-04T16:00:00.0000000Z', 50000.0, N'Active', N'Scooter Eléctrico Xiaomi Pro 2', '22222222-2222-2222-2222-222222222222');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BidCount', N'CategoryId', N'CreatedAt', N'CurrentPrice', N'Description', N'EndDate', N'ExtendedUntil', N'ImageUrl', N'MinimumIncrement', N'SellerId', N'StartDate', N'StartingPrice', N'Status', N'Title', N'WinnerId') AND [object_id] = OBJECT_ID(N'[Auctions]'))
    SET IDENTITY_INSERT [Auctions] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Amount', N'AuctionId', N'BidTime', N'IsWinningBid', N'UserId') AND [object_id] = OBJECT_ID(N'[Bids]'))
    SET IDENTITY_INSERT [Bids] ON;
INSERT INTO [Bids] ([Id], [Amount], [AuctionId], [BidTime], [IsWinningBid], [UserId])
VALUES ('b1111111-1111-1111-1111-111111111111', 35000.0, 'a4444444-4444-4444-4444-444444444444', '2026-09-07T15:15:00.0000000Z', CAST(0 AS bit), '33333333-3333-3333-3333-333333333333'),
('b2222222-2222-2222-2222-222222222222', 45000.0, 'a4444444-4444-4444-4444-444444444444', '2026-09-07T15:30:00.0000000Z', CAST(1 AS bit), '22222222-2222-2222-2222-222222222222'),
('b3333333-3333-3333-3333-333333333333', 120000.0, 'a6666666-6666-6666-6666-666666666666', '2026-09-07T15:50:00.0000000Z', CAST(1 AS bit), '22222222-2222-2222-2222-222222222222'),
('b4444444-4444-4444-4444-444444444444', 28000.0, 'a5555555-5555-5555-5555-555555555555', '2026-09-07T14:00:00.0000000Z', CAST(1 AS bit), '33333333-3333-3333-3333-333333333333');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Amount', N'AuctionId', N'BidTime', N'IsWinningBid', N'UserId') AND [object_id] = OBJECT_ID(N'[Bids]'))
    SET IDENTITY_INSERT [Bids] OFF;

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Details', N'EntityId', N'EntityName', N'EventType', N'IpAddress', N'Timestamp', N'UserId') AND [object_id] = OBJECT_ID(N'[AuditLogs]'))
    SET IDENTITY_INSERT [AuditLogs] ON;
INSERT INTO [AuditLogs] ([Id], [Details], [EntityId], [EntityName], [EventType], [IpAddress], [Timestamp], [UserId])
VALUES ('80000000-0000-0000-0000-000000000001', N'Puja registrada exitosamente por $45.000', 'a4444444-4444-4444-4444-444444444444', N'Auction', N'PUJA_RECIBIDA', N'127.0.0.1', '2026-09-07T15:30:00.0000000Z', '22222222-2222-2222-2222-222222222222'),
('80000000-0000-0000-0000-000000000002', N'Puja registrada exitosamente por $28.000', 'a5555555-5555-5555-5555-555555555555', N'Auction', N'PUJA_RECIBIDA', N'127.0.0.1', '2026-09-07T14:00:00.0000000Z', '33333333-3333-3333-3333-333333333333'),
('80000000-0000-0000-0000-000000000003', N'Puja registrada exitosamente por $120.000', 'a6666666-6666-6666-6666-666666666666', N'Auction', N'PUJA_RECIBIDA', N'127.0.0.1', '2026-09-07T15:50:00.0000000Z', '22222222-2222-2222-2222-222222222222');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Details', N'EntityId', N'EntityName', N'EventType', N'IpAddress', N'Timestamp', N'UserId') AND [object_id] = OBJECT_ID(N'[AuditLogs]'))
    SET IDENTITY_INSERT [AuditLogs] OFF;

CREATE INDEX [IX_Auctions_CategoryId] ON [Auctions] ([CategoryId]);

CREATE INDEX [IX_Bids_AuctionId] ON [Bids] ([AuctionId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260907192047_InitialCreate', N'9.0.2');

COMMIT;
GO

