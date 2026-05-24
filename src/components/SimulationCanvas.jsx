import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import Matter from 'matter-js';

const PARTICLES = [];

const SimulationCanvas = forwardRef(({
  gravityValue,
  planet,
  windForce,
  airResistance,
  slowMotion,
  isPaused,
  dropHeight,
  onPhysicsUpdate,
  onAppleHitGround,
  darkMode,
}, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const appleBodyRef = useRef(null);
  const groundRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const hasHitGroundRef = useRef(false);
  const isDraggingRef = useRef(false);
  const impactParticlesRef = useRef([]);
  const fallingLeavesRef = useRef([]);
  const trailPositionsRef = useRef([]);
  const [dimensions, setDimensions] = useState({ w: 700, h: 500 });

  // Responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        if (w > 0 && h > 0) {
          setDimensions({ w, h });
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, []);

  const getAppleY = useCallback((canvasH) => {
    const dropRatio = (dropHeight - 1) / 9;
    return canvasH * (0.35 - dropRatio * 0.2);
  }, [dropHeight]);

  const spawnImpactParticles = useCallback((x, y) => {
    const count = 12 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const speed = 1 + Math.random() * 4;
      impactParticlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.015 + Math.random() * 0.025,
        size: 2 + Math.random() * 5,
        color: Math.random() > 0.5 ? '#FF6B6B' : '#FFD1DC',
      });
    }
  }, []);

  const addFallingLeaf = useCallback((w, h, time) => {
    if (time % 2 < 0.05 && fallingLeavesRef.current.length < 8) {
      fallingLeavesRef.current.push({
        x: w * (0.3 + Math.random() * 0.5),
        y: h * 0.1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.3 + Math.random() * 0.5,
        size: 3 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        life: 1,
        color: `hsl(${120 + Math.random() * 30}, ${50 + Math.random() * 30}%, ${35 + Math.random() * 20}%)`,
      });
    }
  }, []);

  useImperativeHandle(ref, () => ({
    resetSimulation() {
      resetApple();
    },
    dropApple() {
      if (appleBodyRef.current) {
        const constraint = engineRef.current.world.constraints.find(
          (c) => c.bodyB === appleBodyRef.current
        );
        if (constraint) {
          Matter.World.remove(engineRef.current.world, constraint);
        }
        appleBodyRef.current.isStatic = false;
        hasHitGroundRef.current = false;
        timeRef.current = 0;
      }
    },
  }));

  const resetApple = useCallback(() => {
    if (!engineRef.current || !appleBodyRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const apple = appleBodyRef.current;
    const constraints = engineRef.current.world.constraints.filter(
      (c) => c.bodyB === apple || c.bodyA === apple
    );
    constraints.forEach((c) => {
      Matter.World.remove(engineRef.current.world, c);
    });

    const appleY = getAppleY(dimensions.h);
    Matter.Body.setPosition(apple, { x: dimensions.w * 0.65, y: appleY });
    Matter.Body.setVelocity(apple, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(apple, 0);
    apple.isStatic = true;
    hasHitGroundRef.current = false;
    timeRef.current = 0;
    trailPositionsRef.current = [];

    const constraint = Matter.Constraint.create({
      pointA: { x: 0, y: 0 },
      bodyB: apple,
      pointB: { x: 0, y: 0 },
      stiffness: 0.8,
      damping: 0.1,
      length: 5,
    });
    Matter.World.add(engineRef.current.world, constraint);

    if (onPhysicsUpdate) {
      onPhysicsUpdate({
        velocity: 0, acceleration: 0, force: 0, distance: 0, time: 0,
        x: dimensions.w * 0.65, y: appleY, isFalling: false,
      });
    }
  }, [getAppleY, dimensions, onPhysicsUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.w === 0) return;

    const ctx = canvas.getContext('2d');
    const { w, h } = dimensions;

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: gravityValue, scale: 0.001 },
    });
    engineRef.current = engine;

    const ground = Matter.Bodies.rectangle(w / 2, h - 15, w * 2, 30, {
      isStatic: true, friction: 0.8, restitution: 0.2, label: 'ground',
    });
    groundRef.current = ground;
    const leftWall = Matter.Bodies.rectangle(-10, h / 2, 20, h, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(w + 10, h / 2, 20, h, { isStatic: true });

    const appleRadius = Math.min(18, w * 0.035);
    const appleY = getAppleY(h);
    const apple = Matter.Bodies.circle(w * 0.65, appleY, appleRadius, {
      restitution: 0.3, friction: 0.5, density: 0.002, label: 'apple', render: { visible: false },
    });
    appleBodyRef.current = apple;

    const constraint = Matter.Constraint.create({
      pointA: { x: 0, y: 0 },
      bodyB: apple,
      pointB: { x: 0, y: 0 },
      stiffness: 0.8, damping: 0.1, length: 5,
    });
    Matter.World.add(engine.world, [ground, leftWall, rightWall, apple, constraint]);

    // Store initial setup as reset reference
    const initialAppleY = appleY;

    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        if (
          (pair.bodyA.label === 'apple' && pair.bodyB.label === 'ground') ||
          (pair.bodyA.label === 'ground' && pair.bodyB.label === 'apple')
        ) {
          if (!hasHitGroundRef.current) {
            hasHitGroundRef.current = true;
            spawnImpactParticles(apple.position.x, h - 30);
            onAppleHitGround?.();
          }
        }
      });
    });

    const SWAY_SPEED = 0.5;

    const render = () => {
      if (!isPaused) {
        const delta = slowMotion ? 16.67 : 16.67;
        Matter.Engine.update(engine, delta);
      }

      ctx.clearRect(0, 0, w, h);
      const t = timeRef.current;

      drawSky(ctx, w, h, darkMode);
      drawClouds(ctx, w, h, t, darkMode);
      drawSun(ctx, w, h, darkMode);

      // Sway value for tree
      const sway = Math.sin(t * SWAY_SPEED) * 2;

      drawGround(ctx, w, h, darkMode, t);
      drawTree(ctx, w, h, sway, darkMode);
      drawFallingLeaves(ctx, w, h, t, fallingLeavesRef.current);
      drawApple(ctx, apple, isDraggingRef.current, darkMode);
      drawTrail(ctx, trailPositionsRef.current);
      drawImpactParticles(ctx, impactParticlesRef.current);

      // Wind visualization
      if (Math.abs(windForce) > 0.1) {
        drawWindLines(ctx, w, h, windForce, t);
      }

      if (!isPaused) {
        timeRef.current += slowMotion ? 0.008 : 0.016;

        // Update trail
        if (!apple.isStatic && !hasHitGroundRef.current) {
          trailPositionsRef.current.push({ x: apple.position.x, y: apple.position.y });
          if (trailPositionsRef.current.length > 15) {
            trailPositionsRef.current.shift();
          }
        }

        // Update impact particles
        impactParticlesRef.current = impactParticlesRef.current.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.life -= p.decay;
          return p.life > 0;
        });

        // Update falling leaves
        addFallingLeaf(w, h, t);
        fallingLeavesRef.current = fallingLeavesRef.current.filter((l) => {
          l.x += l.vx + windForce * 0.05;
          l.y += l.vy;
          l.rotation += l.rotSpeed;
          l.life -= 0.003;
          return l.y < h - 30 && l.life > 0;
        });
      }

      // Physics data
      if (apple) {
        const isFalling = !apple.isStatic && !hasHitGroundRef.current;
        const vel = apple.velocity;
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        const startY = getAppleY(h);
        const fallDist = isFalling ? Math.max(0, (h - 30 - apple.position.y) / 100) :
          hasHitGroundRef.current ? Math.max(0, (h - 30 - startY) / 100) : 0;
        const effectiveGravity = airResistance
          ? gravityValue * (1 - Math.exp(-timeRef.current * 0.5))
          : gravityValue;

        onPhysicsUpdate?.({
          velocity: speed,
          acceleration: effectiveGravity,
          force: 0.2 * effectiveGravity,
          distance: fallDist,
          time: timeRef.current,
          x: apple.position.x,
          y: apple.position.y,
          isFalling,
          hasHit: hasHitGroundRef.current,
        });
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      Matter.Engine.clear(engine);
    };
  }, [dimensions]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.gravity.y = gravityValue;
    }
  }, [gravityValue]);

  useEffect(() => {
    if (!engineRef.current) return;
    const applyForces = () => {
      if (!isPaused && appleBodyRef.current && !appleBodyRef.current.isStatic) {
        if (Math.abs(windForce) > 0.01) {
          Matter.Body.applyForce(appleBodyRef.current, appleBodyRef.current.position, {
            x: windForce * 0.0005,
            y: 0,
          });
        }
        if (airResistance) {
          const { x: vx, y: vy } = appleBodyRef.current.velocity;
          const drag = 0.01;
          Matter.Body.applyForce(appleBodyRef.current, appleBodyRef.current.position, {
            x: -vx * drag,
            y: -vy * drag,
          });
        }
      }
      frameRef.current = requestAnimationFrame(applyForces);
    };
    const frameRef = { current: null };
    applyForces();
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [windForce, airResistance, isPaused]);

  const handlePointerDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !appleBodyRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const apple = appleBodyRef.current;
    const dx = x - apple.position.x;
    const dy = y - apple.position.y;

    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      isDraggingRef.current = true;
      const constraints = engineRef.current.world.constraints.filter(
        (c) => c.bodyB === apple || c.bodyA === apple
      );
      constraints.forEach((c) => Matter.World.remove(engineRef.current.world, c));
      apple.isStatic = true;
      hasHitGroundRef.current = false;
      timeRef.current = 0;
    }
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current || !canvasRef.current || !appleBodyRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    Matter.Body.setPosition(appleBodyRef.current, {
      x: Math.max(30, Math.min(canvas.width - 30, x)),
      y: Math.max(30, Math.min(canvas.height - 60, y)),
    });
    Matter.Body.setVelocity(appleBodyRef.current, { x: 0, y: 0 });
  }, []);

  const handlePointerUp = useCallback(() => {
    if (isDraggingRef.current && appleBodyRef.current) {
      isDraggingRef.current = false;
      appleBodyRef.current.isStatic = false;
      hasHitGroundRef.current = false;
      trailPositionsRef.current = [];
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onDown = (e) => { e.preventDefault(); handlePointerDown(e); };
    const onMove = (e) => { e.preventDefault(); handlePointerMove(e); };
    const onUp = (e) => { e.preventDefault(); handlePointerUp(); };
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
        className="w-full h-full rounded-2xl cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
});

function drawSky(ctx, w, h, darkMode) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  if (darkMode) {
    grad.addColorStop(0, '#0f0c29');
    grad.addColorStop(0.5, '#302b63');
    grad.addColorStop(1, '#24243e');
  } else {
    grad.addColorStop(0, '#E8F4FD');
    grad.addColorStop(0.4, '#C9E4FF');
    grad.addColorStop(0.7, '#FFD1DC');
    grad.addColorStop(1, '#D4EDDA');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawSun(ctx, w, h, darkMode) {
  const x = w * 0.85;
  const y = h * 0.1;
  const r = Math.min(35, w * 0.05);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (darkMode) {
    ctx.fillStyle = '#FFEAA7';
    ctx.shadowColor = '#FFEAA7';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#FFF3B0';
    ctx.shadowColor = '#FFEAA7';
    ctx.shadowBlur = 60;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 243, 176, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * (r + 5), y + Math.sin(angle) * (r + 5));
      ctx.lineTo(x + Math.cos(angle) * (r + 20), y + Math.sin(angle) * (r + 20));
      ctx.stroke();
    }
  }
}

function drawClouds(ctx, w, h, t, darkMode) {
  const color = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)';
  const clouds = [
    { x: w * 0.1, y: h * 0.08, s: 0.8, speed: 0.1 },
    { x: w * 0.4, y: h * 0.05, s: 1.0, speed: 0.15 },
    { x: w * 0.7, y: h * 0.12, s: 0.6, speed: 0.08 },
    { x: w * 0.9, y: h * 0.06, s: 0.7, speed: 0.12 },
  ];
  clouds.forEach((c) => {
    const ox = Math.sin(t * c.speed + c.x) * 10;
    drawCloud(ctx, c.x + ox, c.y, c.s, color);
  });
}

function drawCloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  const s = scale;
  ctx.beginPath();
  ctx.arc(x, y, 25 * s, 0, Math.PI * 2);
  ctx.arc(x + 25 * s, y - 10 * s, 30 * s, 0, Math.PI * 2);
  ctx.arc(x + 50 * s, y, 25 * s, 0, Math.PI * 2);
  ctx.arc(x + 25 * s, y + 5 * s, 20 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround(ctx, w, h, darkMode, t) {
  if (darkMode) {
    const grad = ctx.createLinearGradient(0, h - 40, 0, h);
    grad.addColorStop(0, '#2d3436');
    grad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = grad;
  } else {
    const grad = ctx.createLinearGradient(0, h - 40, 0, h);
    grad.addColorStop(0, '#90BE6D');
    grad.addColorStop(0.3, '#7CB342');
    grad.addColorStop(1, '#5D8A3C');
    ctx.fillStyle = grad;
  }
  ctx.fillRect(0, h - 30, w, 30);

  if (!darkMode) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(50 + i * (w / 5), h - 28, 40, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h - 30);
  ctx.lineTo(w, h - 30);
  ctx.stroke();

  if (!darkMode) {
    ctx.strokeStyle = 'rgba(90, 150, 60, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < Math.floor(w / 35); i++) {
      const gx = 20 + i * 35;
      const gy = h - 30;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.quadraticCurveTo(gx + 2, gy - 8, gx + 4, gy - 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gx - 2, gy);
      ctx.quadraticCurveTo(gx, gy - 6, gx + 1, gy - 10);
      ctx.stroke();
    }
  }

  if (!darkMode) {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h - 28, 80, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTree(ctx, w, h, sway, darkMode) {
  const trunkColor = darkMode ? '#3d2b1f' : '#5D4037';
  const branchColor = darkMode ? '#4a3728' : '#6D4C41';
  const leafColor1 = darkMode ? '#1a3a1a' : '#4CAF50';
  const leafColor2 = darkMode ? '#0d2b0d' : '#388E3C';

  ctx.save();

  // Trunk (doesn't sway)
  ctx.fillStyle = trunkColor;
  ctx.beginPath();
  ctx.moveTo(w * 0.48, h - 30);
  ctx.lineTo(w * 0.52, h - 30);
  ctx.lineTo(w * 0.51, h * 0.55);
  ctx.lineTo(w * 0.49, h * 0.55);
  ctx.closePath();
  ctx.fill();

  // Main branches with sway
  ctx.strokeStyle = branchColor;
  ctx.lineCap = 'round';

  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.55);
  ctx.quadraticCurveTo(w * 0.62 + sway * 0.5, h * 0.4, w * 0.7 + sway, h * 0.3);
  ctx.stroke();

  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w * 0.6 + sway * 0.3, h * 0.4);
  ctx.quadraticCurveTo(w * 0.68 + sway * 0.5, h * 0.3, w * 0.75 + sway, h * 0.22);
  ctx.stroke();

  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.55);
  ctx.quadraticCurveTo(w * 0.38 - sway * 0.3, h * 0.45, w * 0.3 - sway, h * 0.35);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w * 0.38 - sway * 0.2, h * 0.48);
  ctx.quadraticCurveTo(w * 0.3 - sway * 0.3, h * 0.4, w * 0.25 - sway, h * 0.33);
  ctx.stroke();

  // Small twigs
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.7 + sway, h * 0.3);
  ctx.quadraticCurveTo(w * 0.75 + sway, h * 0.28, w * 0.8 + sway * 1.2, h * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.65 + sway * 0.5, h * 0.35);
  ctx.quadraticCurveTo(w * 0.7 + sway * 0.5, h * 0.32, w * 0.76 + sway, h * 0.3);
  ctx.stroke();

  ctx.restore();

  // Leaf clusters with sway
  drawLeafCluster(ctx, w * 0.72 + sway * 0.5, h * 0.28, 60, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.3 + sway * 0.3, h * 0.33, 50, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.78 + sway * 0.5, h * 0.22, 45, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.5 + sway * 0.2, h * 0.5, 40, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.38 + sway * 0.3, h * 0.45, 35, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.65 + sway * 0.4, h * 0.38, 35, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.25 + sway * 0.2, h * 0.32, 30, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.82 + sway * 0.5, h * 0.24, 25, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.76 + sway * 0.4, h * 0.29, 20, leafColor1, leafColor2);
}

function drawLeafCluster(ctx, x, y, size, color1, color2) {
  ctx.save();
  for (let i = 4; i >= 0; i--) {
    const r = size * (0.3 + i * 0.15);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? color1 : color2;
    ctx.globalAlpha = Math.min(0.5 + i * 0.1, 0.8);
    ctx.fill();
  }
  ctx.restore();
}

function drawApple(ctx, apple, isDragging, darkMode) {
  if (!apple) return;
  const { x, y } = apple.position;
  const angle = apple.angle;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Shadow
  ctx.beginPath();
  ctx.ellipse(2, 2, 18, 16, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fill();

  // Body
  const grad = ctx.createRadialGradient(-5, -5, 2, 0, 0, 18);
  if (darkMode) {
    grad.addColorStop(0, '#FF8E8E');
    grad.addColorStop(0.5, '#FF6B6B');
    grad.addColorStop(1, '#CC4444');
  } else {
    grad.addColorStop(0, '#FF8E8E');
    grad.addColorStop(0.5, '#FF6B6B');
    grad.addColorStop(1, '#E85050');
  }
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Highlight
  ctx.beginPath();
  ctx.ellipse(-5, -6, 4, 6, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();

  // Stem
  ctx.strokeStyle = darkMode ? '#5D4037' : '#4a3728';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.quadraticCurveTo(3, -24, 4, -26);
  ctx.stroke();

  // Leaf
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.ellipse(5, -24, 6, 3, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  if (isDragging) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();
  }
}

function drawTrail(ctx, trail) {
  if (trail.length < 2) return;
  for (let i = 1; i < trail.length; i++) {
    const alpha = i / trail.length * 0.3;
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, 2 * (i / trail.length), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
    ctx.fill();
  }
}

function drawImpactParticles(ctx, particles) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawFallingLeaves(ctx, w, h, t, leaves) {
  for (const l of leaves) {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rotation);
    ctx.globalAlpha = l.life * 0.6;
    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, l.size, l.size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawWindLines(ctx, w, h, force, t) {
  const intensity = Math.min(Math.abs(force) * 0.04, 0.3);
  ctx.strokeStyle = `rgba(200, 220, 255, ${intensity})`;
  ctx.lineWidth = 1;
  const dir = force > 0 ? 1 : -1;
  const count = Math.floor(Math.abs(force) * 3);
  for (let i = 0; i < count; i++) {
    const x = (t * 50 * dir + i * (w / count)) % w;
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dir * 30, y);
    ctx.stroke();
  }
}

export default SimulationCanvas;
