function calcDelta() {
  const wheels = ['as', 'ad', 'ps', 'pd'];
  
  wheels.forEach(w => {
      const inVal = parseFloat(document.getElementById(`${w}_in`).value);
      const outVal = parseFloat(document.getElementById(`${w}_out`).value);
      const deltaDisplay = document.getElementById(`d_${w}`);
      
      if (!isNaN(inVal) && !isNaN(outVal)) {
          const delta = (outVal - inVal).toFixed(2);
          deltaDisplay.innerText = `Δ: ${delta}`;
          deltaDisplay.style.color = delta > 0 ? "#2e7d32" : "#d32f2f";
      } else {
          deltaDisplay.innerText = "Δ: --";
          deltaDisplay.style.color = "var(--primary)";
      }
  });
}

// ... restanti funzioni loadWeather, salvaSessione, esportaCSV ...