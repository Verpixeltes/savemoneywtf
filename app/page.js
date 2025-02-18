"use client";
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import 'tailwindcss/tailwind.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Erweiterte Geräte mit Leistungsangaben und durchschnittlichem Stromverbrauch
const devices = {
  computer: { name: 'Computer', power: 0.2, yearlyUsage: 200 }, // 200 kWh pro Jahr
  fridge: { name: 'Kühlschrank', power: 0.1, yearlyUsage: 70 }, // 70 kWh pro Jahr
  washingMachine: { name: 'Waschmaschine', power: 0.5, yearlyUsage: 150 },
  dryer: { name: 'Trockner', power: 2.5, yearlyUsage: 200 },
  dishwasher: { name: 'Geschirrspüler', power: 1.8, yearlyUsage: 250 },
  tv: { name: 'Fernseher', power: 0.1, yearlyUsage: 100 },
  laptop: { name: 'Laptop', power: 0.05, yearlyUsage: 50 },
  microwave: { name: 'Mikrowelle', power: 0.8, yearlyUsage: 40 },
  vacuumCleaner: { name: 'Staubsauger', power: 0.8, yearlyUsage: 30 },
  kettle: { name: 'Wasserkocher', power: 2.0, yearlyUsage: 70 },
  coffeeMachine: { name: 'Kaffeemaschine', power: 0.8, yearlyUsage: 50 },
  toaster: { name: 'Toaster', power: 1.0, yearlyUsage: 10 },
  hairDryer: { name: 'Haartrockner', power: 1.2, yearlyUsage: 20 },
  heater: { name: 'Heizlüfter', power: 2.0, yearlyUsage: 200 },
  airConditioner: { name: 'Klimaanlage', power: 2.0, yearlyUsage: 400 },
  stove: { name: 'Elektroherd', power: 3.0, yearlyUsage: 500 },
  oven: { name: 'Backofen', power: 2.0, yearlyUsage: 300 },
};

export default function Home() {
  const [selectedDevices, setSelectedDevices] = useState({});
  const [numDevices, setNumDevices] = useState({});
  const [renewablePricePerKWh, setRenewablePricePerKWh] = useState(0.06); // Erneuerbare Energie (Solar, Wind, etc.)
  const [fossilPricePerKWh, setFossilPricePerKWh] = useState(0.10); // Fossile Energie (z.B. Kohle)

  const [timePeriod, setTimePeriod] = useState('month'); // 'month', 'year', '10years'
  const [savings, setSavings] = useState(0);
  const [timeSeries, setTimeSeries] = useState({
    labels: ['0', '1', '2', '3', '4', '5'],
    datasets: [
      {
        label: 'Ersparnisse in € (Erneuerbar vs Fossil)',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
    ],
  });

  // Gesamtverbrauch berechnen
  const totalPowerUsage = Object.keys(selectedDevices).reduce((total, deviceKey) => {
    const device = devices[deviceKey];
    const quantity = numDevices[deviceKey] || 0;
    return total + device.power * quantity;
  }, 0);

  // Berechnung der Kosten
  const renewableCost = totalPowerUsage * renewablePricePerKWh;
  const fossilCost = totalPowerUsage * fossilPricePerKWh;

  // Berechnung der Ersparnisse
  useEffect(() => {
    let timeMultiplier = 1;
    switch (timePeriod) {
      case 'month':
        timeMultiplier = 720; // 24 Stunden * 30 Tage
        break;
      case 'year':
        timeMultiplier = 8760; // 24 Stunden * 365 Tage
        break;
      case '10years':
        timeMultiplier = 87600; // 24 Stunden * 365 Tage * 10 Jahre
        break;
      default:
        timeMultiplier = 1;
    }

    const savedAmount = (fossilCost - renewableCost) * timeMultiplier;
    setSavings(savedAmount);
  }, [numDevices, renewablePricePerKWh, fossilPricePerKWh, timePeriod]);

  // Graph aktualisieren
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
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-5">Wählen Sie Geräte</h2>
          <div className="space-y-4">
            {Object.keys(devices).map((deviceKey) => (
              <div key={deviceKey} className="flex justify-between items-center">
                <span>{devices[deviceKey].name} (Durchschnittlicher Verbrauch: {devices[deviceKey].yearlyUsage} kWh/Jahr)</span>
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
                  <span>{numDevices[deviceKey] || 0} Geräte</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-5">Vergleich zwischen Erneuerbaren und Fossilen Energien</h2>
          <div className="space-y-4">
            <p>Gesamtverbrauch: {totalPowerUsage.toFixed(2)} kWh pro Stunde</p>
            <p>Stromkosten (Erneuerbare Energie): {renewableCost.toFixed(2)} €</p>
            <p>Stromkosten (Fossile Energie): {fossilCost.toFixed(2)} €</p>
            <p className="text-green-400">Ersparnisse bei Erneuerbarer Energie ({timePeriod}): {savings.toFixed(2)} €</p>
            <div className="mt-5">
              <Line data={timeSeries} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <h3 className="text-lg font-semibold">Energiepreise:</h3>
        <div className="space-x-4">
          <span className="bg-green-500 text-white px-6 py-2 rounded-full">Erneuerbar: {renewablePricePerKWh} €/kWh</span>
          <span className="bg-red-500 text-white px-6 py-2 rounded-full">Fossil: {fossilPricePerKWh} €/kWh</span>
        </div>
        <div className="mt-5">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-full mt-4"
            onClick={() => setRenewablePricePerKWh(0.06)}
          >
            Setze Preis für Erneuerbare auf 0,06 €/kWh
          </button>
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-full mt-4"
            onClick={() => setFossilPricePerKWh(0.10)}
          >
            Setze Preis für Fossil auf 0,10 €/kWh
          </button>
        </div>

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
