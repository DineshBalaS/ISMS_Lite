// document.addEventListener("DOMContentLoaded", function () {
//   const table = document.getElementById("adminRiskTable");
//   const impactFilter = document.getElementById("impactFilter");

//   if (!table || !impactFilter) return;

//   // Sorting Logic
//   function sortTable(n) {
//     const tbody = table.querySelector("tbody");
//     const rows = Array.from(tbody.rows);
//     let dir = "asc";
//     const header = table.querySelectorAll("th")[n];

//     if (header.dataset.sorted === "asc") dir = "desc";
//     header.dataset.sorted = dir;

//     rows.sort((a, b) => {
//       let x = a.cells[n].textContent.trim();
//       let y = b.cells[n].textContent.trim();

//       if (n === 2 || n === 3) {
//         x = parseFloat(x) || 0;
//         y = parseFloat(y) || 0;
//       }

//       return dir === "asc" ? (x > y ? 1 : -1) : x < y ? 1 : -1;
//     });

//     rows.forEach((row) => tbody.appendChild(row));
//   }

//   const headers = table.querySelectorAll("th");
//   headers.forEach((header, i) => {
//     header.addEventListener("click", () => sortTable(i));
//   });

//   // FILTERING Logic
//   function filterByImpact() {
//     const selected = impactFilter.value.toLowerCase();
//     const rows = table.querySelectorAll("tbody tr");

//     rows.forEach((row) => {
//       const impactCell = row.cells[5]; // Risk Level column
//       const rowImpact = impactCell.dataset.impact?.toLowerCase() || "";
//       row.style.display =
//         selected === "" || rowImpact === selected ? "" : "none";
//     });
//   }

//   impactFilter.addEventListener("change", filterByImpact);
//   filterByImpact(); // Run once on load

//   // CHART LOGIC
//   const riskDataElement = document.getElementById("riskDataJSON");
//   if (!riskDataElement) return;

//   const allRisks = JSON.parse(riskDataElement.textContent);
//   const riskCounts = { low: 0, medium: 0, high: 0 };
//   allRisks.forEach((risk) => {
//     const level = risk.risk_level.toLowerCase();
//     if (riskCounts[level] !== undefined) riskCounts[level]++;
//   });

//   new Chart(document.getElementById("riskLevelChart").getContext("2d"), {
//     type: "pie",
//     data: {
//       labels: ["Low", "Medium", "High"],
//       datasets: [
//         {
//           label: "Risk Levels",
//           data: [riskCounts.low, riskCounts.medium, riskCounts.high],
//           backgroundColor: [
//             "rgba(75, 192, 192, 0.6)",
//             "rgba(255, 206, 86, 0.6)",
//             "rgba(255, 99, 132, 0.6)",
//           ],
//         },
//       ],
//     },
//     options: {
//       plugins: { legend: { position: "bottom" } },
//     },
//   });

//   new Chart(document.getElementById("riskFreqChart").getContext("2d"), {
//     type: "bar",
//     data: {
//       labels: ["Low", "Medium", "High"],
//       datasets: [
//         {
//           label: "Number of Risks",
//           data: [riskCounts.low, riskCounts.medium, riskCounts.high],
//           backgroundColor: [
//             "rgba(75, 192, 192, 0.6)",
//             "rgba(255, 206, 86, 0.6)",
//             "rgba(255, 99, 132, 0.6)",
//           ],
//           borderRadius: 6,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       scales: {
//         y: {
//           beginAtZero: true,
//           ticks: { stepSize: 1 },
//         },
//       },
//     },
//   });

//   const timeChartElement = document.getElementById("timeChartData");
//   if (timeChartElement) {
//     const { labels, data } = JSON.parse(timeChartElement.textContent);
//     const ctx = document.getElementById("timeRiskChart").getContext("2d");

//     new Chart(ctx, {
//       type: "line",
//       data: {
//         labels: labels,
//         datasets: [
//           {
//             label: "Risks Reported",
//             data: data,
//             backgroundColor: "rgba(59,130,246,0.5)",
//             borderColor: "rgba(59,130,246,1)",
//             fill: true,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         scales: {
//           y: { beginAtZero: true },
//         },
//       },
//     });
//   }
// });

// document.addEventListener("DOMContentLoaded", function () {
//   const table = document.getElementById("adminRiskTable");
//   const impactFilter = document.getElementById("impactFilter");
//   const statusFilter = document.getElementById("statusFilter");

//   if (!table || !impactFilter || !statusFilter) return;

//   function filterTable() {
//     const impactVal = impactFilter.value.toLowerCase();
//     const statusVal = statusFilter.value.toLowerCase();

//     const rows = table.querySelectorAll("tbody tr");
//     rows.forEach((row) => {
//       const impactCell = row.cells[5]; // Risk Level
//       const statusCell = row.cells[8]; // Status

//       const rowImpact = impactCell.dataset.impact?.toLowerCase() || "";
//       const rowStatus = statusCell.textContent.trim().toLowerCase();

//       const impactMatch = !impactVal || rowImpact === impactVal;
//       const statusMatch = !statusVal || rowStatus === statusVal;

//       row.style.display = impactMatch && statusMatch ? "" : "none";
//     });
//   }

//   impactFilter.addEventListener("change", filterTable);
//   statusFilter.addEventListener("change", filterTable);

//   filterTable(); // Initial filter on page load
// });

document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("adminRiskTable");
  const impactFilter = document.getElementById("impactFilter");
  const statusFilter = document.getElementById("statusFilter");

  if (!table || !impactFilter || !statusFilter) return;

  // Sorting Logic
  function sortTable(n) {
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.rows);
    let dir = "asc";
    const header = table.querySelectorAll("th")[n];

    if (header.dataset.sorted === "asc") dir = "desc";
    header.dataset.sorted = dir;

    rows.sort((a, b) => {
      let x = a.cells[n].textContent.trim();
      let y = b.cells[n].textContent.trim();

      if (n === 2 || n === 3) {
        // Impact or Likelihood numeric columns
        x = parseFloat(x) || 0;
        y = parseFloat(y) || 0;
      }

      return dir === "asc" ? (x > y ? 1 : -1) : x < y ? 1 : -1;
    });

    rows.forEach((row) => tbody.appendChild(row));
  }

  const headers = table.querySelectorAll("th");
  headers.forEach((header, i) => {
    header.addEventListener("click", () => sortTable(i));
  });

  // Filtering Logic
  function filterTable() {
    const impactVal = impactFilter.value.toLowerCase();
    const statusVal = statusFilter.value.toLowerCase();

    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const impactCell = row.cells[5]; // Risk Level
      const statusCell = row.cells[8]; // Status

      const rowImpact = impactCell.dataset.impact?.toLowerCase() || "";
      const rowStatus = statusCell.textContent.trim().toLowerCase();

      const impactMatch = !impactVal || rowImpact === impactVal;
      const statusMatch = !statusVal || rowStatus === statusVal;

      row.style.display = impactMatch && statusMatch ? "" : "none";
    });
  }

  impactFilter.addEventListener("change", filterTable);
  statusFilter.addEventListener("change", filterTable);
  filterTable(); // Run initially

  // Charts
  const riskDataElement = document.getElementById("riskDataJSON");
  if (!riskDataElement) return;

  const allRisks = JSON.parse(riskDataElement.textContent);
  const riskCounts = { low: 0, medium: 0, high: 0 };
  allRisks.forEach((risk) => {
    const level = risk.risk_level.toLowerCase();
    if (riskCounts[level] !== undefined) riskCounts[level]++;
  });

  // Pie Chart - Risk Level Distribution
  new Chart(document.getElementById("riskLevelChart").getContext("2d"), {
    type: "pie",
    data: {
      labels: ["Low", "Medium", "High"],
      datasets: [
        {
          label: "Risk Levels",
          data: [riskCounts.low, riskCounts.medium, riskCounts.high],
          backgroundColor: [
            "rgba(34,197,94,0.7)", // green
            "rgba(234,179,8,0.7)", // yellow
            "rgba(239,68,68,0.7)", // red
          ],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#C9D1D9", // white-ish labels
          },
        },
      },
    },
  });

  // Bar Chart - Most Frequent Risk Levels
  new Chart(document.getElementById("riskFreqChart").getContext("2d"), {
    type: "bar",
    data: {
      labels: ["Low", "Medium", "High"],
      datasets: [
        {
          label: "Number of Risks",
          data: [riskCounts.low, riskCounts.medium, riskCounts.high],
          backgroundColor: [
            "rgba(34,197,94,0.7)",
            "rgba(234,179,8,0.7)",
            "rgba(239,68,68,0.7)",
          ],
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: { color: "#C9D1D9" },
          grid: { color: "#2F333A" },
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#C9D1D9" },
          grid: { color: "#2F333A" },
        },
      },
      plugins: {
        legend: { labels: { color: "#C9D1D9" } },
      },
    },
  });

  // Line Chart - Risks Over Time
  const timeChartElement = document.getElementById("timeChartData");
  if (timeChartElement) {
    const { labels, data } = JSON.parse(timeChartElement.textContent);
    new Chart(document.getElementById("timeRiskChart").getContext("2d"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Risks Reported",
            data: data,
            fill: true,
            backgroundColor: "rgba(59,130,246,0.2)",
            borderColor: "rgba(59,130,246,1)",
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: {
              display: false, // Hides x-axis labels
            },
            grid: {
              display: false, // Optional: Hides x-axis grid lines too if you want
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
});
