export const planets = [
  {
    id: 'earth',
    name: 'Earth',
    gravity: 9.81,
    color: '#4A90D9',
    bgColor: '#E8F4FD',
    description: 'Our home planet. g = 9.81 m/s²',
    icon: '🌍',
  },
  {
    id: 'moon',
    name: 'Moon',
    gravity: 1.62,
    color: '#B0B0B0',
    bgColor: '#E8E8E8',
    description: 'Earth\'s natural satellite. g = 1.62 m/s²',
    icon: '🌙',
  },
  {
    id: 'mars',
    name: 'Mars',
    gravity: 3.72,
    color: '#E27B58',
    bgColor: '#FFE8E0',
    description: 'The Red Planet. g = 3.72 m/s²',
    icon: '🔴',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    gravity: 24.79,
    color: '#D4A574',
    bgColor: '#FFF0E0',
    description: 'The largest planet. g = 24.79 m/s²',
    icon: '🟠',
  },
];

export const getGravity = (planetId) => {
  const planet = planets.find((p) => p.id === planetId);
  return planet ? planet.gravity : 9.81;
};
