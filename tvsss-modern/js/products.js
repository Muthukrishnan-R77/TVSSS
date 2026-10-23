/* ============================================================
   TVSSS MODERN — DATA: Products, Segments, Manufacturing,
   Timeline, Certifications, Customers
   ============================================================ */

const TVSSS_DATA = {

  /* ── Product Categories ── */
  productCategories: [
    {
      id: 'sensors',
      number: '01',
      title: 'Sensors & Sensing Solutions',
      desc: 'Precision sensing technologies for mobility, industrial, and EV applications.',
      image: '../wp-content/uploads/2022/03/Sensors-sensing-solutions-1024x1024.jpg',
      link: '../sensors-sensing-solutions/'
    },
    {
      id: 'switches',
      number: '02',
      title: 'Switches & Controls',
      desc: 'Reliable switching solutions engineered for demanding automotive environments.',
      image: '../wp-content/uploads/2022/03/Switches-Controls-1024x1024.jpg',
      link: '../switches-controls/'
    },
    {
      id: 'solenoids',
      number: '03',
      title: 'Solenoids',
      desc: 'High-performance solenoid assemblies for precision actuation and control.',
      image: '../wp-content/uploads/2022/03/Solenoids-1024x1024.jpg',
      link: '../solenoids/'
    },
    {
      id: 'electromech',
      number: '04',
      title: 'Electro Mechanical Assembly',
      desc: 'Integrated electro-mechanical solutions combining electronics and mechanics.',
      image: '../wp-content/uploads/2022/03/Electro-Mechanical-Assembly-1024x1024.jpg',
      link: '../electro-mechanical-assembly/'
    },
    {
      id: 'computer',
      number: '05',
      title: 'Computer Input Devices',
      desc: 'Specialised keyboards and input devices for industrial and commercial use.',
      image: '../wp-content/uploads/2022/03/Computer-Input-devices-1024x1024.jpg',
      link: '../computer-input-devices/'
    },
    {
      id: 'ev',
      number: '06',
      title: 'Electric Vehicle Solutions',
      desc: 'Next-generation sensing and control systems purpose-built for electric vehicles.',
      image: '../wp-content/uploads/2022/03/EV-Solutions-1024x1024.jpg',
      link: '../electric-vehicles-solutions/'
    },
    {
      id: 'iot',
      number: '07',
      title: 'IoT 4.0 Products',
      desc: 'Smart connected products for Industry 4.0 and Industrial IoT applications.',
      image: '../wp-content/uploads/2022/03/IOT-4.0-Products-1024x1024.jpg',
      link: '../iot-4-0-products/'
    }
  ],

  /* ── Application Segments ── */
  segments: {
    'two-wheeler': {
      label: 'Two Wheeler',
      image: '../wp-content/uploads/2022/04/two-wheeler.png',
      products: [
        'ABS wheel speed sensor',
        'Speed / direction sensor',
        'Brake / clutch switch',
        'E-bike speed sensor',
        'Glove-box solenoid',
        'Seat-latch solenoid',
        'Steering-lock control solenoid',
        'Gear-position sensor',
        'Stop-lamp switch',
        'USB charger'
      ]
    },
    'passenger-cars': {
      label: 'Passenger Cars',
      image: '../wp-content/uploads/2022/04/four-wheeler.png',
      products: [
        'Turbocharger actuator',
        'ABS wheel speed sensor',
        'Wiring harness',
        'Tailgate latch assembly',
        'Central locking switch',
        'Key reminder switch',
        'Door latch switch',
        'Electronic component carrier',
        'Hood latch switch',
        'Commutator assembly'
      ]
    },
    'commercial': {
      label: 'Commercial / Off-Road',
      image: '../wp-content/uploads/2022/04/Commercial-vehicle.png',
      products: [
        'Linear-position sensor',
        'Speed / direction sensor',
        'Solenoid assemblies',
        'Cold-advance solenoid',
        'Fuel-injector coil',
        'Engine shut-off solenoid',
        'Intake throttle valve cover',
        'PTO switch',
        'Passive wheel-speed sensor'
      ]
    },
    'electric-vehicle': {
      label: 'Electric Vehicle',
      image: '../wp-content/uploads/2022/03/EV-Solutions-1024x1024.jpg',
      products: [
        'ABS wheel-speed sensor',
        'DC-DC converter',
        'E-throttle position sensor',
        'Side-stand sensor',
        'USB charger',
        'Boot-light switch',
        'Thermistor assembly',
        'Battery-temperature sensor',
        'Speed / direction sensor',
        'Audio-visual unit',
        'Battery-charge-lock solenoid',
        'Acoustic vehicle monitoring system',
        'Tyre-pressure system sensor'
      ]
    },
    'industrial': {
      label: 'Industrial',
      image: '../wp-content/uploads/2022/04/industrial-products.png',
      products: [
        'ATEX reed sensor',
        'Float sensor',
        'Speed / direction sensor',
        'Door curtain sensor',
        'Rocker switches',
        'Plastic reed sensor',
        'Snap-action micro switches',
        'Angular sensor',
        'Elevator door switch',
        'Position sensor'
      ]
    }
  },

  /* ── Manufacturing Capabilities ── */
  manufacturing: [
    { num: '01', title: 'Micro / High Precision\nHorizontal Molding', image: '../wp-content/uploads/2022/03/MACHINE2.jpg' },
    { num: '02', title: 'High Precision /\nHigh Speed Stamping',    image: '../wp-content/uploads/2022/03/machine.jpg' },
    { num: '03', title: 'Insert Molding\n— Vertical',               image: '../manufacturing-excellence/1.jpg' },
    { num: '04', title: 'Joining Process\nSoldering / Pulse Heat',  image: '../manufacturing-excellence/4.jpg' },
    { num: '05', title: 'Ultrasonic\nWelding',                      image: '../wp-content/uploads/2022/03/MACHINE2.jpg' },
    { num: '06', title: 'Wiring\nHarness',                          image: '../wp-content/uploads/2022/08/AHI-Wiring-harness.png' },
    { num: '07', title: 'Low Pressure\nMolding',                    image: '../wp-content/uploads/2022/03/machine.jpg' },
    { num: '08', title: 'End of Line\nTesters',                     image: '../manufacturing-excellence/4.jpg' },
    { num: '09', title: 'Tooling',                                  image: '../manufacturing-excellence/1.jpg' },
    { num: '10', title: 'Coil\nWinding',                            image: '../wp-content/uploads/2022/03/MACHINE2.jpg' },
    { num: '11', title: 'Laser\nPrinting',                          image: '../wp-content/uploads/2022/03/machine.jpg' },
    { num: '12', title: 'Potting &\nDispensing',                    image: '../manufacturing-excellence/1.jpg' }
  ],

  /* ── Engineering Stages ── */
  engineering: [
    {
      num: '01',
      title: 'Application Engineering',
      desc: 'Deep understanding of customer requirements, application environments, and performance specifications.'
    },
    {
      num: '02',
      title: 'Testing & Validation',
      desc: 'Rigorous testing protocols ensuring products meet and exceed international quality standards.'
    },
    {
      num: '03',
      title: 'Tooling & Prototype',
      desc: 'In-house tooling capabilities enabling rapid prototyping and precise manufacturing readiness.'
    },
    {
      num: '04',
      title: 'Design Concepts & Innovation',
      desc: 'Continuous innovation driving next-generation sensing solutions for evolving mobility needs.'
    }
  ],

  /* ── EV Products ── */
  evProducts: [
    'ABS wheel-speed sensor', 'DC-DC converter', 'E-throttle position sensor',
    'Side-stand sensor', 'USB charger', 'Boot-light switch',
    'Thermistor assembly', 'Battery-temperature sensor', 'Speed / direction sensor',
    'Battery-charge-lock solenoid', 'Tyre-pressure system sensor',
    'Acoustic vehicle monitoring system'
  ],

  /* ── IIoT Topics ── */
  iiotTopics: [
    { icon: '📡', name: 'IIoT',               desc: 'Industrial Internet of Things' },
    { icon: '🧠', name: 'Machine Learning',    desc: 'AI-driven process intelligence' },
    { icon: '🔍', name: 'Smart Sensing',       desc: 'Connected sensor networks' },
    { icon: '☁️', name: 'Cloud Computing',     desc: 'Scalable data infrastructure' },
    { icon: '🤖', name: 'Robotics',            desc: 'Automated precision assembly' },
    { icon: '⚙️', name: 'Machine Automation',  desc: 'Production line optimisation' },
    { icon: '🔄', name: 'Digital Twins',       desc: 'Virtual factory simulation' },
    { icon: '📊', name: 'Analytics',           desc: 'Real-time data insights' }
  ],

  /* ── Company Timeline ── */
  timeline: [
    { year: '1911', event: 'TVS Group founded by Shri T.V. Sundaram Iyengar' },
    { year: '1962', event: 'TVS expands into auto components manufacturing' },
    { year: '1994', event: 'TVS Sensing Solutions established in Madurai' },
    { year: '2000', event: 'Expansion of manufacturing capabilities' },
    { year: '2005', event: 'Recognised as 100% Export Oriented Unit' },
    { year: '2008', event: 'IATF 16949 certification achieved' },
    { year: '2012', event: 'ISO 14001 Environmental Management certification' },
    { year: '2013', event: 'Expansion into EV sensing solutions' },
    { year: '2018', event: 'ISO 45001 Occupational Health & Safety certification' },
    { year: '2019', event: 'Industry 4.0 / IIoT capabilities established' },
    { year: '2023', event: 'Advanced EV and smart sensing portfolio expansion' },
    { year: '2024', event: 'Continued growth in EV and mobility technology' }
  ],

  /* ── Certifications ── */
  certifications: [
    { name: 'IATF 16949', standard: 'Automotive Quality Management', icon: '🏆', doc: null },
    { name: 'ISO 9001',   standard: 'Quality Management System',      icon: '✅', doc: null },
    { name: 'ISO 14001',  standard: 'Environmental Management',       icon: '🌿', doc: null },
    { name: 'ISO 45001',  standard: 'Occupational Health & Safety',   icon: '🛡️', doc: null },
    { name: 'UL',         standard: 'Product Safety Certification',   icon: '🔒', doc: null },
    { name: 'ATEX',       standard: 'Explosive Atmosphere Certified', icon: '⚡', doc: null },
    { name: 'VDE',        standard: 'German Electrical Safety',       icon: '🔬', doc: null },
    { name: 'ENEC',       standard: 'European Safety Mark',           icon: '🇪🇺', doc: null }
  ],

  /* ── Customers ── */
  customers: [
    { name: 'Brakes India',  logo: '../wp-content/uploads/2022/01/breaks-india-1-150x150.png' },
    { name: 'Fiat',          logo: '../wp-content/uploads/2022/01/fiat-logo-1-150x150.png' },
    { name: 'Ford',          logo: '../wp-content/uploads/2022/01/ford-logo-1-150x150.png' },
    { name: 'Hella',         logo: '../wp-content/uploads/2022/01/hella-logo-1-150x150.png' },
    { name: 'Hyundai',       logo: '../wp-content/uploads/2022/01/Hyundai-logo-1-150x150.png' },
    { name: 'JCB',           logo: '../wp-content/uploads/2022/01/jcb-1-150x150.png' },
    { name: 'John Deere',    logo: '../wp-content/uploads/2022/01/John_Deere-Logo-1-150x150.png' },
    { name: 'Mahindra',      logo: '../wp-content/uploads/2022/01/Mahindra-logo-1-150x150.png' },
    { name: 'Nissan',        logo: '../wp-content/uploads/2022/01/nission-icon-1-150x150.png' },
    { name: 'Renault',       logo: '../wp-content/uploads/2022/01/renault-logo-1-150x150.png' },
    { name: 'TAFE',          logo: '../wp-content/uploads/2022/01/tafe-logo-1-150x150.png' },
    { name: 'Tata',          logo: '../wp-content/uploads/2022/01/Tata-logo-1-150x150.png' },
    { name: 'Turbo',         logo: '../wp-content/uploads/2022/01/turbo-logo-1-150x150.png' }
  ]
};

/* Make available globally */
window.TVSSS_DATA = TVSSS_DATA;
