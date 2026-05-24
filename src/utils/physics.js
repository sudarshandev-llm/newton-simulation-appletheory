export const calculatePhysics = ({
  gravity,
  time,
  initialVelocity = 0,
  mass = 0.2,
  airResistance = false,
  windForce = 0,
}) => {
  const effectiveGravity = airResistance
    ? gravity * (1 - Math.exp(-time * 0.5))
    : gravity;

  const velocity = initialVelocity + effectiveGravity * time;
  const distance = initialVelocity * time + 0.5 * effectiveGravity * time * time;
  const acceleration = airResistance
    ? effectiveGravity - 0.1 * velocity
    : effectiveGravity;
  const force = mass * effectiveGravity;

  const windEffect = windForce * time;

  return {
    velocity: Math.abs(velocity),
    acceleration: Math.abs(acceleration),
    force: Math.abs(force),
    distance: Math.abs(distance + windEffect * 0.1),
    time,
    windOffset: windEffect,
    effectiveGravity,
  };
};

export const getPlanetColor = (planetId) => {
  const colors = {
    earth: '#4A90D9',
    moon: '#B0B0B0',
    mars: '#E27B58',
    jupiter: '#D4A574',
  };
  return colors[planetId] || '#4A90D9';
};

export const getFormulaValues = (gravity, mass, time, velocity, distance, acceleration) => {
  return [
    {
      formula: 'F = mg',
      latex: 'F = m × g',
      values: `F = ${mass.toFixed(2)} × ${gravity.toFixed(2)} = ${(mass * gravity).toFixed(2)} N`,
    },
    {
      formula: 'v = u + at',
      latex: 'v = u + at',
      values: `v = 0 + ${acceleration.toFixed(2)} × ${time.toFixed(2)} = ${velocity.toFixed(2)} m/s`,
    },
    {
      formula: 's = ut + ½at²',
      latex: 's = ut + ½at²',
      values: `s = 0 + ½ × ${acceleration.toFixed(2)} × ${(time * time).toFixed(2)} = ${distance.toFixed(2)} m`,
    },
  ];
};
