function IsLoading () {
    return (
        <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
}

function NoData () {
     return (
  <div className="alert alert-info" role="alert">
    No data available for the selected date range.
  </div>
  );
}  

// function to parse the date dimension values
function parseRequest (request) {
  const { dimensionHeaders, metricHeaders, rows } = request;

  const parseData = {
    dimension: {},
    metric: {}
  };

  // Initialize dimension objects with keys from dimensionHeaders
  dimensionHeaders.forEach((header, index) => {
    parseData.dimension[header.name] = [];
  });

  // Initialize metric objects with keys from metricHeaders
  metricHeaders.forEach((header, index) => {
    parseData.metric[header.name] = [];
  });

  // Populate dimension and metric values from rows
  rows.forEach((row) => {
    row.dimensionValues.forEach((dimensionValue, index) => {
      parseData.dimension[dimensionHeaders[index].name].push(dimensionValue.value);
    });

    row.metricValues.forEach((metricValue, index) => {
      parseData.metric[metricHeaders[index].name].push(metricValue.value);
    });
  });

  return parseData;
}

export { parseRequest, IsLoading, NoData }
