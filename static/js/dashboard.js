document.addEventListener("DOMContentLoaded", function () {
  console.log("Debug: JavaScript is running!");

  let table = document.getElementById("riskTable");

  if (!table) {
    console.error("Error: Table with id 'riskTable' NOT FOUND in DOM!");
    return;
  }

  function sortTable(n) {
    let tbody = table.getElementsByTagName("tbody")[0];
    let rows = Array.from(tbody.getElementsByTagName("tr"));

    // Store original `data-impact` values in an array
    let dataImpactValues = rows.map((row) => row.cells[2].dataset.impact);

    let dir = "asc";
    let header = table.getElementsByTagName("th")[n];

    if (header.dataset.sorted === "asc") {
      dir = "desc";
    }

    header.dataset.sorted = dir;

    // Sort rows
    rows.sort((a, b) => {
      let x = a.cells[n].textContent.trim();
      let y = b.cells[n].textContent.trim();

      if (n === 2 || n === 3) {
        // If sorting Impact or Likelihood (numeric)
        x = parseFloat(x) || 0;
        y = parseFloat(y) || 0;
      }

      return dir === "asc" ? (x > y ? 1 : -1) : x < y ? 1 : -1;
    });

    // Reappend sorted rows
    rows.forEach((row) => tbody.appendChild(row));

    // Restore `data-impact` values after sorting
    rows.forEach((row, index) => {
      row.cells[2].dataset.impact = dataImpactValues[index];
    });

    // Reapply filter after sorting
    filterTable();
  }

  function filterTable() {
    let selectedImpact = document.getElementById("impactFilter").value;
    let selectedStatus = document
      .getElementById("statusFilter")
      .value.toLowerCase();
    let impactMap = { 1: "low", 2: "medium", 3: "high" };
    selectedImpact = impactMap[selectedImpact] || "";

    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
      let impactCell = rows[i].cells[4]; // Correct - this is the "Risk Level" column with data-impact
      let statusCell = rows[i].cells[5]; // Status column

      if (impactCell && statusCell) {
        let impactText = impactCell.dataset.impact?.trim().toLowerCase();
        let statusText = statusCell.textContent.trim().toLowerCase();

        let impactMatch =
          selectedImpact === "" || impactText === selectedImpact;
        let statusMatch =
          selectedStatus === "" || statusText === selectedStatus;

        rows[i].style.display = impactMatch && statusMatch ? "" : "none";
      }
    }
  }

  document
    .getElementById("statusFilter")
    .addEventListener("change", filterTable);

  // Attach sorting to headers
  let headers = table.getElementsByTagName("th");
  for (let i = 0; i < headers.length; i++) {
    headers[i].addEventListener("click", () => sortTable(i));
  }

  filterTable();

  document
    .getElementById("downloadReport")
    .addEventListener("click", function () {
      // window.location.href = "/generate_report"; // Call backend route
    });

  document.getElementById("exportCsv").addEventListener("click", function () {
    const selectedImpact = document.getElementById("impactFilter").value;
    const exportUrl = `/export?impact=${selectedImpact}`;
    window.location.href = exportUrl;
  });

  document
    .getElementById("downloadReport")
    .addEventListener("click", function (e) {
      e.preventDefault();
      const rows = document.querySelectorAll("#riskTable tbody tr");
      const filteredRisks = [];

      rows.forEach((row) => {
        if (row.style.display !== "none") {
          const title = row.cells[0].innerText;
          const description = row.cells[1].innerText;
          const impact = row.cells[2].innerText;
          const likelihood = row.cells[3].innerText;
          const risk_level = row.cells[4].innerText;

          filteredRisks.push({
            title,
            description,
            impact,
            likelihood,
            risk_level,
          });
        }
      });

      fetch("/generate_report_filtered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ risks: filteredRisks }),
      })
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "filtered_compliance_report.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
    });

  function updateChartWithFilters() {
    const selectedRiskLevel = document.getElementById(
      "chartRiskLevelFilter"
    ).value;
    const minImpact =
      parseInt(document.getElementById("chartImpactMin").value) || 1;
    const minLikelihood =
      parseInt(document.getElementById("chartLikelihoodMin").value) || 1;

    const rows = document.querySelectorAll("#riskTable tbody tr");

    let counts = { low: 0, medium: 0, high: 0 };

    rows.forEach((row) => {
      const style = window.getComputedStyle(row);
      if (style.display === "none") return; // Skip hidden rows from table filter

      const riskLevel = row.cells[4].innerText.trim().toLowerCase();
      const impact = parseInt(row.cells[2].innerText.trim());
      const likelihood = parseInt(row.cells[3].innerText.trim());

      const levelMatch = !selectedRiskLevel || riskLevel === selectedRiskLevel;
      const impactMatch = impact >= minImpact;
      const likelihoodMatch = likelihood >= minLikelihood;

      if (levelMatch && impactMatch && likelihoodMatch) {
        counts[riskLevel]++;
      }
    });

    // Update chart
    if (typeof riskChart !== "undefined") {
      riskChart.data.datasets[0].data = [
        counts.low,
        counts.medium,
        counts.high,
      ];
      riskChart.update();
    }
  }

  // Attach event listeners to new filter inputs
  document
    .getElementById("chartRiskLevelFilter")
    .addEventListener("change", updateChartWithFilters);
  document
    .getElementById("chartImpactMin")
    .addEventListener("input", updateChartWithFilters);
  document
    .getElementById("chartLikelihoodMin")
    .addEventListener("input", updateChartWithFilters);
});
