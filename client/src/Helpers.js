// Parse the reponse and returns a data object with  in a data results of a runReport call.
function ParseComboChart(response) {

    response.rows.forEach(row => {
      let data = {
        labels: row.dimensionValues.map(dimensionValue => dimensionValue.value),
        datasets: response.metricHeaders.map((metricHeader, index) => ({
          type: 'bar',
          label: metricHeader.name,
          data: row.metricValues.map(metricValue => metricValue.value)
        }))
      };

    // replace the value of key 'type' the last dataset with a line chart type.
    data.datasets[data.datasets.length -1].type = 'line';
    // add the value of key 'fill' the last dataset with a false value.
    data.datasets[data.datasets.length -1].fill = false;
    return data;
  });

}

function IsLoading () {
    return (
        <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
}

export { ParseComboChart, IsLoading }
