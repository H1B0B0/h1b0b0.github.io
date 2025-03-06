import * as THREE from "three";

interface PlanetConfig {
  radius: number;
  color: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  hasRings?: boolean;
  hasClouds?: boolean;
  moons?: Array<{
    radius: number;
    color: number;
    orbitRadius: number;
    orbitSpeed: number;
  }>;
}

export const createPlanetSystem = () => {
  const planetGroup = new THREE.Group();

  // Create a star at the center
  const starGeometry = new THREE.SphereGeometry(2, 32, 32);
  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    const starMaterial = new THREE.ShaderMaterial({     uniforms: {       time: { value: 0.0 },       color: { value: new THREE.Color(0xffd700) }     },     vertexShader: `       varying vec3 vNormal;       varying vec3 vPosition;              void main() {         vNormal = normalize(normalMatrix * normal); // Planet configurations
  const planets: Plan        vPosition = position; radi        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);       }R    `,o    fragmentShader: `       uniform float time;
      uniform vec3 color;       varying vec3 vNormal;i      varying vec3 vPosition;c      :      void main() {r        // Base glow3c,
      orbitRadius: 15,
      orbitSpeed: 0.003,
      rotationSpeed: 0.008,
      hasRings: true,
    },
    {
      radius: 0.8,
      color: 0x9b59b6,
      orbitRadius: 20,
      orbitSpeed: 0.002,
      rotationSpeed: 0.015,
      moons: [
        { radius: 0.15, color: 0xbdc3c7, orbitRadius: 1.5, orbitSpeed: 0.03 },
        { radius: 0.12, color: 0x95a5a6, orbitRadius: 2.2, orbitSpeed: 0.02 },
      ],
    },
  ];

  // Create planets
  const planetObjects = planets.map((config, index) => {
    const planetObj = new THREE.Group();
    planetObj.userData = {
      orbitRadius: config.orbitRadius,
      orbitSpeed: config.orbitSpeed,
    };

    // Planet body
    const planetGeometry = new THREE.SphereGeometry(config.radius, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.7,
      metalness: 0.1,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planetObj.add(planet);

    // Add rings if specified
    if (config.hasRings) {
      const ringGeometry = new THREE.RingGeometry(
        config.radius + 0.5,
        config.radius + 1.5,
        32
      );
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      planetObj.add(ring);
    }

    // Add clouds if specified
    if (config.hasClouds) {
      const cloudGeometry = new THREE.SphereGeometry(
        config.radius + 0.05,
        32,
        32
      );
      const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        alphaMap: new THREE.TextureLoader().load("/textures/cloud.jpg"),
      });
      const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
      planetObj.add(clouds);
    }

    // Add moons if specified
    if (config.moons) {
      config.moons.forEach((moon) => {
        const moonGroup = new THREE.Group();
        moonGroup.userData = {
          orbitRadius: moon.orbitRadius,
          orbitSpeed: moon.orbitSpeed,
        };

        const moonGeometry = new THREE.SphereGeometry(moon.radius, 16, 16);
        const moonMaterial = new THREE.MeshStandardMaterial({
          color: moon.color,
          roughness: 0.8,
          metalness: 0.1,
        });
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        moonMesh.position.x = moon.orbitRadius;

        moonGroup.add(moonMesh);
        planetObj.add(moonGroup);
      });
    }

    // Set initial position
    const angle = (index / planets.length) * Math.PI * 2;
    planetObj.position.x = Math.cos(angle) * config.orbitRadius;
    planetObj.position.z = Math.sin(angle) * config.orbitRadius;

    return { object: planetObj, config };
  });

  // Add all planets to the group
  planetObjects.forEach(({ object }) => {
    planetGroup.add(object);
  });

  // Create orbit lines
  planets.forEach((planet) => {
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitPoints = [];

    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      orbitPoints.push(
        Math.cos(angle) * planet.orbitRadius,
        0,
        Math.sin(angle) * planet.orbitRadius
      );
    }

    orbitGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(orbitPoints, 3)
    );

    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });

    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    planetGroup.add(orbit);
  });

  // Animation function
  const animate = () => {
    // Rotate the star
    star.rotation.y += 0.001;

    // Animate planets
    planetObjects.forEach(({ object, config }) => {
      // Planet orbit
      const time = Date.now() * 0.001;
      const orbitRadius = object.userData.orbitRadius;
      const orbitSpeed = object.userData.orbitSpeed;

      object.position.x = Math.cos(time * orbitSpeed) * orbitRadius;
      object.position.z = Math.sin(time * orbitSpeed) * orbitRadius;

      // Planet rotation
      const planet = object.children[0];
      if (planet) {
        planet.rotation.y += config.rotationSpeed;
      }

      // Moon orbit
      object.children.forEach((child) => {
        if (child instanceof THREE.Group && child.userData.orbitRadius) {
          const moonTime = Date.now() * 0.001;
          const moonOrbitRadius = child.userData.orbitRadius;
          const moonOrbitSpeed = child.userData.orbitSpeed;

          const moon = child.children[0];
          if (moon) {
            moon.position.x =
              Math.cos(moonTime * moonOrbitSpeed) * moonOrbitRadius;
            moon.position.z =
              Math.sin(moonTime * moonOrbitSpeed) * moonOrbitRadius;
          }
        }
      });
    });
  };

  return {
    group: planetGroup,
    animate,
  };
};
