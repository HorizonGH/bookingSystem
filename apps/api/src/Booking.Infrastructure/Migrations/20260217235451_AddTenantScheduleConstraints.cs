using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Booking.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantScheduleConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AllowedScheduleDays",
                table: "Tenants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "1,2,3,4,5,6");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "DefaultScheduleEndTime",
                table: "Tenants",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 18, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "DefaultScheduleStartTime",
                table: "Tenants",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 9, 0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowedScheduleDays",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "DefaultScheduleEndTime",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "DefaultScheduleStartTime",
                table: "Tenants");
        }
    }
}
