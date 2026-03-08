using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Booking.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationUniqueTimeSlotIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Reservations_Worker_TimeSlot_NoCancelled",
                table: "Reservations",
                columns: new[] { "WorkerId", "StartTime", "EndTime" },
                unique: true,
                filter: "\"ReservationStatus\" != 2 AND \"StatusBaseEntity\" != 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_Worker_TimeSlot_NoCancelled",
                table: "Reservations");
        }
    }
}
