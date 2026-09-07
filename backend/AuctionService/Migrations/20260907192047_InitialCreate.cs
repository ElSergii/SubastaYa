using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AuctionService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EntityName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sales",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuctionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SellerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BuyerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FinalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SaleDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Auctions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartingPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrentPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MinimumIncrement = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SellerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WinnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExtendedUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BidCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auctions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Auctions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Bids",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuctionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BidTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsWinningBid = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bids", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bids_Auctions_AuctionId",
                        column: x => x.AuctionId,
                        principalTable: "Auctions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Description", "Icon", "Name" },
                values: new object[,]
                {
                    { new Guid("c1111111-1111-1111-1111-111111111111"), "Laptops, Smartphones, Consolas y Gadgets", "Computer", "Tecnología" },
                    { new Guid("c2222222-2222-2222-2222-222222222222"), "Arte, Antigüedades, Relojes y Rarezas", "Diamond", "Coleccionables" },
                    { new Guid("c3333333-3333-3333-3333-333333333333"), "Ropa Vintage, Zapatillas y Accesorios de Lujo", "Checkroom", "Indumentaria" },
                    { new Guid("c4444444-4444-4444-4444-444444444444"), "Autos, Motos, Scooters y Movilidad", "DirectionsCar", "Vehículos" }
                });

            migrationBuilder.InsertData(
                table: "Auctions",
                columns: new[] { "Id", "BidCount", "CategoryId", "CreatedAt", "CurrentPrice", "Description", "EndDate", "ExtendedUntil", "ImageUrl", "MinimumIncrement", "SellerId", "StartDate", "StartingPrice", "Status", "Title", "WinnerId" },
                values: new object[,]
                {
                    { new Guid("a1111111-1111-1111-1111-111111111111"), 2, new Guid("c1111111-1111-1111-1111-111111111111"), new DateTime(2026, 9, 7, 15, 0, 0, 0, DateTimeKind.Utc), 45000m, "Laptop profesional Apple M3 Max en estado impecable con caja original y cargador 140W.", new DateTime(2026, 9, 7, 16, 25, 0, 0, DateTimeKind.Utc), null, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", 2000m, new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 9, 7, 15, 0, 0, 0, DateTimeKind.Utc), 30000m, "Active", "MacBook Pro M3 Max 16 inch 36GB RAM", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("a2222222-2222-2222-2222-222222222222"), 1, new Guid("c2222222-2222-2222-2222-222222222222"), new DateTime(2026, 9, 7, 14, 0, 0, 0, DateTimeKind.Utc), 120000m, "Edición de colección con certificado de autenticidad y service reciente.", new DateTime(2026, 9, 7, 16, 0, 45, 0, DateTimeKind.Utc), null, "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80", 5000m, new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 9, 7, 14, 0, 0, 0, DateTimeKind.Utc), 100000m, "Active", "Reloj Rolex Submariner Date 1998 Original", new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("a3333333-3333-3333-3333-333333333333"), 0, new Guid("c2222222-2222-2222-2222-222222222222"), new DateTime(2026, 9, 7, 16, 0, 0, 0, DateTimeKind.Utc), 80000m, "Instrumento de gama alta con estuche rigido Custom Shop.", new DateTime(2026, 9, 9, 16, 0, 0, 0, DateTimeKind.Utc), null, "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80", 2500m, new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 9, 8, 16, 0, 0, 0, DateTimeKind.Utc), 80000m, "Upcoming", "Guitarra Gibson Les Paul Standard 1959 Reissue", null },
                    { new Guid("a4444444-4444-4444-4444-444444444444"), 3, new Guid("c3333333-3333-3333-3333-333333333333"), new DateTime(2026, 9, 5, 16, 0, 0, 0, DateTimeKind.Utc), 28000m, "Chaqueta clásica de cuero vacuno talle M en excelente estado.", new DateTime(2026, 9, 7, 15, 0, 0, 0, DateTimeKind.Utc), null, "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80", 1000m, new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 9, 5, 16, 0, 0, 0, DateTimeKind.Utc), 15000m, "Active", "Chaqueta de Cuero Vintage Schott NYC", new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("a5555555-5555-5555-5555-555555555555"), 0, new Guid("c4444444-4444-4444-4444-444444444444"), new DateTime(2026, 9, 4, 16, 0, 0, 0, DateTimeKind.Utc), 50000m, "Scooter urbano 45km autonomía con freno de disco y pantalla digital.", new DateTime(2026, 9, 7, 14, 0, 0, 0, DateTimeKind.Utc), null, "https://images.unsplash.com/photo-1597086884617-64b58e72efcb?auto=format&fit=crop&w=800&q=80", 2000m, new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 9, 4, 16, 0, 0, 0, DateTimeKind.Utc), 50000m, "Active", "Scooter Eléctrico Xiaomi Pro 2", null }
                });

            migrationBuilder.InsertData(
                table: "Bids",
                columns: new[] { "Id", "Amount", "AuctionId", "BidTime", "IsWinningBid", "UserId" },
                values: new object[,]
                {
                    { new Guid("b1111111-1111-1111-1111-111111111111"), 35000m, new Guid("a1111111-1111-1111-1111-111111111111"), new DateTime(2026, 9, 7, 15, 15, 0, 0, DateTimeKind.Utc), false, new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("b2222222-2222-2222-2222-222222222222"), 45000m, new Guid("a1111111-1111-1111-1111-111111111111"), new DateTime(2026, 9, 7, 15, 30, 0, 0, DateTimeKind.Utc), true, new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("b3333333-3333-3333-3333-333333333333"), 120000m, new Guid("a2222222-2222-2222-2222-222222222222"), new DateTime(2026, 9, 7, 15, 50, 0, 0, DateTimeKind.Utc), true, new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("b4444444-4444-4444-4444-444444444444"), 28000m, new Guid("a4444444-4444-4444-4444-444444444444"), new DateTime(2026, 9, 7, 14, 0, 0, 0, DateTimeKind.Utc), true, new Guid("22222222-2222-2222-2222-222222222222") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Auctions_CategoryId",
                table: "Auctions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Bids_AuctionId",
                table: "Bids",
                column: "AuctionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "Bids");

            migrationBuilder.DropTable(
                name: "Sales");

            migrationBuilder.DropTable(
                name: "Auctions");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
