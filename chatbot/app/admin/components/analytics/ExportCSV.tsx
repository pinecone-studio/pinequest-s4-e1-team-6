"use client";

export default function ExportCSV({ orders }: any) {
  const exportData = () => {
    const rows = [
      ["ID", "Total", "Status", "Date"],
      ...orders.map((o: any) => [
        o.id,
        o.total,
        o.status,
        o.createdAt,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "orders.csv";
    link.click();
  };

  return (
    <button
      onClick={exportData}
      className="bg-green-600 px-3 py-1 rounded"
    >
      Export CSV
    </button>
  );
}