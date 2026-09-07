using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace WalletService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Wallets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TotalBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AvailableBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    HeldBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wallets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WalletTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WalletId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RelatedAuctionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WalletTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WalletTransactions_Wallets_WalletId",
                        column: x => x.WalletId,
                        principalTable: "Wallets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Wallets",
                columns: new[] { "Id", "AvailableBalance", "CreatedAt", "HeldBalance", "TotalBalance", "UpdatedAt", "UserId" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), 0m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0m, 0m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("20000000-0000-0000-0000-000000000002"), 105000m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 45000m, 150000m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("30000000-0000-0000-0000-000000000003"), 200000m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0m, 200000m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("40000000-0000-0000-0000-000000000004"), 500m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0m, 500m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("44444444-4444-4444-4444-444444444444") }
                });

            migrationBuilder.InsertData(
                table: "WalletTransactions",
                columns: new[] { "Id", "Amount", "CreatedAt", "Description", "RelatedAuctionId", "Status", "Type", "WalletId" },
                values: new object[,]
                {
                    { new Guid("90000000-0000-0000-0000-000000000001"), 150000m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Depósito inicial de saldo", null, "Completed", "Deposit", new Guid("20000000-0000-0000-0000-000000000002") },
                    { new Guid("90000000-0000-0000-0000-000000000002"), 45000m, new DateTime(2026, 1, 1, 1, 0, 0, 0, DateTimeKind.Utc), "Retención de puja en subasta activa MacBook Pro M3", new Guid("a1111111-1111-1111-1111-111111111111"), "Completed", "Hold", new Guid("20000000-0000-0000-0000-000000000002") },
                    { new Guid("90000000-0000-0000-0000-000000000003"), 200000m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Depósito inicial de saldo", null, "Completed", "Deposit", new Guid("30000000-0000-0000-0000-000000000003") },
                    { new Guid("90000000-0000-0000-0000-000000000004"), 500m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Depósito inicial de prueba de saldo insuficiente", null, "Completed", "Deposit", new Guid("40000000-0000-0000-0000-000000000004") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_UserId",
                table: "Wallets",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransactions_WalletId",
                table: "WalletTransactions",
                column: "WalletId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WalletTransactions");

            migrationBuilder.DropTable(
                name: "Wallets");
        }
    }
}
