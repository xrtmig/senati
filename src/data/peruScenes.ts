export interface PeruScene {
  id: string;
  name: string;
  region: string;
  elevation: string;
  subtitle: string;
  coordinates: string;
  image: string;
  headline: string;
}

export const PERU_SCENES: PeruScene[] = [
  {
    id: 'machu-picchu',
    name: 'Machu Picchu',
    region: 'Cusco, Perú',
    elevation: '2,430 m s. n. m.',
    subtitle: 'Santuario Histórico · Amanecer andino',
    coordinates: '13°09′47″S 72°32′44″O',
    image: '/backgrounds/machu-picchu.jpg',
    headline: 'Tu acceso digital unificado en todo el Perú.',
  },
  {
    id: 'lima-costa-verde',
    name: 'Costa Verde, Miraflores',
    region: 'Lima, Perú',
    elevation: '79 m s. n. m.',
    subtitle: 'Acantilados frente al Océano Pacífico',
    coordinates: '12°07′55″S 77°01′58″O',
    image: '/backgrounds/lima-costa-verde.jpg',
    headline: 'Conectando servicios modernos de costa a sierra.',
  },
  {
    id: 'cusco-plaza',
    name: 'Plaza de Armas',
    region: 'Cusco, Perú',
    elevation: '3,399 m s. n. m.',
    subtitle: 'Centro Histórico · Patrimonio Cultural',
    coordinates: '13°31′00″S 71°58′43″O',
    image: '/backgrounds/cusco-plaza.jpg',
    headline: 'Identidad digital segura desde cualquier región.',
  },
];
