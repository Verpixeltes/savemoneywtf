import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'tailwindcss/tailwind.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Erweiterte Geräteliste mit Angaben zur Leistung (W) und zum jährlichen Verbrauch (kWh/Jahr)
const devices = {
  computer: { name: 'Computer', power: 100, yearlyUsage: 200 }, // 200 kWh/Jahr
  fridge: { name: 'Kühlschrank', power: 100, yearlyUsage: 70 },   // 70 kWh/Jahr
  washingMachine: { name: 'Waschmaschine', power: 500, yearlyUsage: 150 },
  dryer: { name: 'Trockner', power: 2500, yearlyUsage: 200 },
  dishwasher: { name: 'Geschirrspüler', power: 1800, yearlyUsage: 250 },
  tv: { name: 'Fernseher', power: 100, yearlyUsage: 100 },
  laptop: { name: 'Laptop', power: 50, yearlyUsage: 50 },
  microwave: { name: 'Mikrowelle', power: 800, yearlyUsage: 40 },
  vacuumCleaner: { name: 'Staubsauger', power: 800, yearlyUsage: 30 },
  kettle: { name: 'Wasserkocher', power: 2000, yearlyUsage: 70 },
  coffeeMachine: { name: 'Kaffeemaschine', power: 800, yearlyUsage: 50 },
  toaster: { name: 'Toaster', power: 1000, yearlyUsage: 10 },
  hairDryer: { name: 'Haartrockner', power: 1200, yearlyUsage: 20 },
  heater: { name: 'Heizlüfter', power: 2000, yearlyUsage: 200 },
  airConditioner: { name: 'Klimaanlage', power: 2000, yearlyUsage: 400 },
  stove: { name: 'Elektroherd', power: 3000, yearlyUsage: 500 },
  oven: { name: 'Backofen', power: 2000, yearlyUsage: 300 },
};

export default function Home() {
  const [selectedDevices, setSelectedDevices] = useState({});
  const [numDevices, setNumDevices] = useState({});
  // Realistische Preise in €/kWh:
  const [renewablePricePerKWh, setRenewablePricePerKWh] = useState(0.94); // Erneuerbare Energien
  const [fossilPricePerKWh, setFossilPricePerKWh] = useState(1.29);       // Fossile Energien

  const [timePeriod, setTimePeriod] = useState('month'); // 'month', 'year', '10years'
  const [savings, setSavings] = useState(0);
  const [timeSeries, setTimeSeries] = useState({
    labels: ['0', '1', '2', '3', '4', '5'],
    datasets: [
      {
        label: 'Ersparnisse in € (Fossil - Erneuerbar)',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
    ],
  });

  // Berechne den durchschnittlichen Verbrauch pro Stunde (in kWh)
  // 1 Jahr hat 8760 Stunden.
  const totalPowerUsage = Object.keys(selectedDevices).reduce((total, deviceKey) => {
    const device = devices[deviceKey];
    const quantity = numDevices[deviceKey] || 0;
    return total + (device.yearlyUsage / 8760) * quantity;
  }, 0);

  // Anzahl der Stunden im gewählten Zeitraum
  let periodHours = 1;
  switch (timePeriod) {
    case 'month':
      periodHours = 720; // ca. 30 Tage
      break;
    case 'year':
      periodHours = 8760; // 365 Tage
      break;
    case '10years':
      periodHours = 87600; // 10 Jahre
      break;
    default:
      periodHours = 1;
  }

  // Berechne die Stromkosten im gewählten Zeitraum
  const renewableCost = totalPowerUsage * periodHours * renewablePricePerKWh;
  const fossilCost = totalPowerUsage * periodHours * fossilPricePerKWh;

  // Ersparnisse: Differenz der Kosten
  useEffect(() => {
    const savedAmount = fossilCost - renewableCost;
    setSavings(savedAmount);
  }, [totalPowerUsage, renewableCost, fossilCost, timePeriod]);

  // Aktualisiere den Graphen (Live-Graph)
  useEffect(() => {
    setTimeSeries((prevState) => {
      const newData = [...prevState.datasets[0].data];
      newData.push(savings);
      newData.shift();
      return { ...prevState, datasets: [{ ...prevState.datasets[0], data: newData }] };
    });
  }, [savings]);

  const handleAddDevice = (deviceKey) => {
    setSelectedDevices({ ...selectedDevices, [deviceKey]: devices[deviceKey] });
    setNumDevices({ ...numDevices, [deviceKey]: (numDevices[deviceKey] || 0) + 1 });
  };

  const handleRemoveDevice = (deviceKey) => {
    if (numDevices[deviceKey] > 0) {
      setNumDevices({ ...numDevices, [deviceKey]: numDevices[deviceKey] - 1 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-center mb-10">Stromverbrauch & Kosten-Simulation</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Geräteliste */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-5">Wählen Sie Geräte</h2>
          <div className="space-y-4">
            {Object.keys(devices).map((deviceKey) => (
              <div key={deviceKey} className="flex justify-between items-center">
                <span>
                  {devices[deviceKey].name} (Ø Verbrauch: {devices[deviceKey].yearlyUsage} kWh/Jahr)
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-full"
                    onClick={() => handleAddDevice(deviceKey)}
                  >
                    +
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-full"
                    onClick={() => handleRemoveDevice(deviceKey)}
                  >
                    -
                  </button>
                  <span>{numDevices[deviceKey] || 0}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vergleichsansicht */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-5">Vergleich: Erneuerbar vs. Fossil</h2>
          <div className="space-y-4">
            <p>
              Durchschnittlicher Verbrauch: {totalPowerUsage.toFixed(3)} kWh pro Stunde <br />
              (entspricht {(totalPowerUsage * periodHours).toFixed(1)} kWh in {timePeriod})
            </p>
            <p>Stromkosten (Erneuerbar): {renewableCost.toFixed(2)} €</p>
            <p>Stromkosten (Fossil): {fossilCost.toFixed(2)} €</p>
            <p className="text-green-400">
              Ersparnisse (Fossil - Erneuerbar) in {timePeriod}: {savings.toFixed(2)} €
            </p>
            <div className="mt-5">
              <Line data={timeSeries} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      </div>

      {/* Steuerung */}
      <div className="mt-10 text-center">
        <h3 className="text-lg font-semibold">Energiepreise:</h3>
        <div className="space-x-4">
          <span className="bg-green-500 text-white px-6 py-2 rounded-full">
            Erneuerbar: {renewablePricePerKWh} €/kWh
          </span>
          <span className="bg-red-500 text-white px-6 py-2 rounded-full">
            Fossil: {fossilPricePerKWh} €/kWh
          </span>
        </div>
        <div className="mt-5">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-full mt-4"
            onClick={() => setRenewablePricePerKWh(0.94)}
          >
            Setze Preis Erneuerbar auf 0,94 €/kWh
          </button>
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-full mt-4"
            onClick={() => setFossilPricePerKWh(1.29)}
          >
            Setze Preis Fossil auf 1,29 €/kWh
          </button>
        </div>

        {/* Zeitraum-Auswahl */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-5">Zeitraum auswählen</h3>
          <div className="space-x-4">
            <button
              className={`px-6 py-2 rounded-full ${timePeriod === 'month' ? 'bg-green-500' : 'bg-gray-600'}`}
              onClick={() => setTimePeriod('month')}
            >
              1 Monat
            </button>
            <button
              className={`px-6 py-2 rounded-full ${timePeriod === 'year' ? 'bg-green-500' : 'bg-gray-600'}`}
              onClick={() => setTimePeriod('year')}
            >
              1 Jahr
            </button>
            <button
              className={`px-6 py-2 rounded-full ${timePeriod === '10years' ? 'bg-green-500' : 'bg-gray-600'}`}
              onClick={() => setTimePeriod('10years')}
            >
              10 Jahre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
