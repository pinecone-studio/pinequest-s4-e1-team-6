"use client";

export default function ExportCSV({ orders }: any) {
  const exportData = () => {
    const rows = [
      ["ID", "Total", "Status", "Date"],
      ...orders.map((o: any) => [o.id, o.total, o.status, o.createdAt]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "orders.csv";
    link.click();
  };

  return (
    <button
      onClick={exportData}
      className="bg-green-600 hover:bg-green-500 active:scale-95 transition-all duration-150 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg w-full sm:w-auto"
    >
      Export CSV
    </button>
  );
}
