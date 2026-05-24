import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';

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
  const engineRef = useRef(null);
  const appleBodyRef = useRef(null);
  const treeAnchorRef = useRef(null);
  const groundRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const hasHitGroundRef = useRef(false);
  const isDraggingRef = useRef(false);
  const windParticlesRef = useRef([]);
  const leavesRef = useRef([]);

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

  const getAppleY = (canvasH) => {
    const dropRatio = (dropHeight - 1) / 9;
    return canvasH * (0.35 - dropRatio * 0.2);
  };

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

    const appleY = getAppleY(canvas.height);
    Matter.Body.setPosition(apple, { x: canvas.width * 0.65, y: appleY });
    Matter.Body.setVelocity(apple, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(apple, 0);
    apple.isStatic = true;
    hasHitGroundRef.current = false;
    timeRef.current = 0;

    const anchor = treeAnchorRef.current;
    if (anchor) {
      const constraint = Matter.Constraint.create({
        pointA: { x: anchor.x - canvas.width * 0.65, y: anchor.y - canvas.height * 0.15 },
        bodyB: apple,
        pointB: { x: 0, y: 0 },
        stiffness: 0.8,
        damping: 0.1,
        length: 5,
      });
      Matter.World.add(engineRef.current.world, constraint);
    }

    if (onPhysicsUpdate) {
      onPhysicsUpdate({
        velocity: 0,
        acceleration: 0,
        force: 0,
        distance: 0,
        time: 0,
        x: canvas.width * 0.65,
        y: canvas.height * 0.15,
        isFalling: false,
      });
    }
  }, [onPhysicsUpdate]);

  const createWindParticle = useCallback((x, y) => {
    return {
      x,
      y,
      vx: -2 - Math.random() * 3,
      vy: (Math.random() - 0.5) * 1,
      life: 1,
      size: 2 + Math.random() * 3,
      color: `rgba(200, 220, 255, ${0.3 + Math.random() * 0.4})`,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: gravityValue, scale: 0.001 },
    });
    engineRef.current = engine;

    const w = canvas.width;
    const h = canvas.height;

    const ground = Matter.Bodies.rectangle(w / 2, h - 15, w * 2, 30, {
      isStatic: true,
      friction: 0.8,
      restitution: 0.2,
      label: 'ground',
    });
    groundRef.current = ground;

    const leftWall = Matter.Bodies.rectangle(-10, h / 2, 20, h, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(w + 10, h / 2, 20, h, { isStatic: true });

    const appleRadius = 18;
    const appleY = getAppleY(h);
    const apple = Matter.Bodies.circle(w * 0.65, appleY, appleRadius, {
      restitution: 0.3,
      friction: 0.5,
      density: 0.002,
      label: 'apple',
      render: { visible: false },
    });
    appleBodyRef.current = apple;

    treeAnchorRef.current = { x: w * 0.65, y: appleY };

    const constraint = Matter.Constraint.create({
      pointA: { x: 0, y: 0 },
      bodyB: apple,
      pointB: { x: 0, y: 0 },
      stiffness: 0.8,
      damping: 0.1,
      length: 5,
    });

    Matter.World.add(engine.world, [ground, leftWall, rightWall, apple, constraint]);

    // Collision detection
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        if (
          (pair.bodyA.label === 'apple' && pair.bodyB.label === 'ground') ||
          (pair.bodyA.label === 'ground' && pair.bodyB.label === 'apple')
        ) {
          if (!hasHitGroundRef.current) {
            hasHitGroundRef.current = true;
            onAppleHitGround?.();
          }
        }
      });
    });

    const render = () => {
      if (!isPaused) {
        const delta = slowMotion ? 1000 / 60 / 4 : 1000 / 60;
        Matter.Engine.update(engine, delta);
      }

      ctx.clearRect(0, 0, w, h);

      drawSky(ctx, w, h, darkMode);
      drawClouds(ctx, w, h, timeRef.current, darkMode);
      drawSun(ctx, w, h, darkMode);
      drawGround(ctx, w, h, darkMode);
      drawTree(ctx, w, h, darkMode);
      drawApple(ctx, apple, w, h, isDraggingRef.current, darkMode);
      drawWindParticles(ctx, windForce, w, h);
      drawLeaves(ctx, w, h, timeRef.current);
      drawConstraints(ctx, engine);

      if (!isPaused) {
        timeRef.current += slowMotion ? 0.008 : 0.016;
      }

      // Update physics data
      if (apple) {
        const isFalling = !apple.isStatic && !hasHitGroundRef.current;
        const vel = apple.velocity;
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        const dist = isFalling ? (h * 0.85 - apple.position.y) / 100 : 0;

        const effectiveGravity = airResistance
          ? gravityValue * (1 - Math.exp(-timeRef.current * 0.5))
          : gravityValue;

        onPhysicsUpdate?.({
          velocity: speed,
          acceleration: effectiveGravity,
          force: 0.2 * effectiveGravity,
          distance: Math.max(0, dist),
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      Matter.Engine.clear(engine);
    };
  }, []);

  // Apply wind force each frame
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.gravity.y = gravityValue;
    engineRef.current.gravity.scale = 0.001;

    const applyWind = () => {
      if (!isPaused && appleBodyRef.current && Math.abs(windForce) > 0.01 && !appleBodyRef.current.isStatic) {
        Matter.Body.applyForce(appleBodyRef.current, appleBodyRef.current.position, {
          x: windForce * 0.0005,
          y: 0,
        });
      }
      if (!isPaused && appleBodyRef.current && airResistance && !appleBodyRef.current.isStatic) {
        const vx = appleBodyRef.current.velocity.x;
        const vy = appleBodyRef.current.velocity.y;
        const drag = 0.01;
        Matter.Body.applyForce(appleBodyRef.current, appleBodyRef.current.position, {
          x: -vx * drag,
          y: -vy * drag,
        });
      }
      requestRef.current = requestAnimationFrame(applyWind);
    };

    const requestRef = { current: null };
    applyWind();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gravityValue, windForce, airResistance, isPaused]);

  const handlePointerDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !appleBodyRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const apple = appleBodyRef.current;
    const dx = x - apple.position.x;
    const dy = y - apple.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40) {
      isDraggingRef.current = true;
      const constraints = engineRef.current.world.constraints.filter(
        (c) => c.bodyB === apple || c.bodyA === apple
      );
      constraints.forEach((c) => {
        Matter.World.remove(engineRef.current.world, c);
      });
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
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e) => {
      e.preventDefault();
      handlePointerDown(e);
    };
    const onMove = (e) => {
      e.preventDefault();
      handlePointerMove(e);
    };
    const onUp = (e) => {
      e.preventDefault();
      handlePointerUp();
    };

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
    <canvas
      ref={canvasRef}
      width={700}
      height={500}
      className="w-full h-full rounded-2xl cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    />
  );
});

function drawSky(ctx, w, h, darkMode) {
  if (darkMode) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0f0c29');
    grad.addColorStop(0.5, '#302b63');
    grad.addColorStop(1, '#24243e');
    ctx.fillStyle = grad;
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#E8F4FD');
    grad.addColorStop(0.4, '#C9E4FF');
    grad.addColorStop(0.7, '#FFD1DC');
    grad.addColorStop(1, '#D4EDDA');
    ctx.fillStyle = grad;
  }
  ctx.fillRect(0, 0, w, h);
}

function drawSun(ctx, w, h, darkMode) {
  const x = w * 0.85;
  const y = h * 0.1;

  if (darkMode) {
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#FFEAA7';
    ctx.fill();
    ctx.shadowColor = '#FFEAA7';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF3B0';
    ctx.fill();
    ctx.shadowColor = '#FFEAA7';
    ctx.shadowBlur = 60;
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Rays
    ctx.strokeStyle = 'rgba(255, 243, 176, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * 40, y + Math.sin(angle) * 40);
      ctx.lineTo(x + Math.cos(angle) * 55, y + Math.sin(angle) * 55);
      ctx.stroke();
    }
  }
}

function drawClouds(ctx, w, h, time, darkMode) {
  const cloudColor = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)';
  const cloudColor2 = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)';

  const clouds = [
    { x: w * 0.1, y: h * 0.08, s: 0.8, speed: 0.1 },
    { x: w * 0.4, y: h * 0.05, s: 1.0, speed: 0.15 },
    { x: w * 0.7, y: h * 0.12, s: 0.6, speed: 0.08 },
    { x: w * 0.9, y: h * 0.06, s: 0.7, speed: 0.12 },
  ];

  clouds.forEach((cloud) => {
    const ox = Math.sin(time * cloud.speed + cloud.x) * 10;
    const cx = cloud.x + ox;
    drawCloud(ctx, cx, cloud.y, cloud.s, cloudColor);
  });
}

function drawCloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 25 * scale, 0, Math.PI * 2);
  ctx.arc(x + 25 * scale, y - 10 * scale, 30 * scale, 0, Math.PI * 2);
  ctx.arc(x + 50 * scale, y, 25 * scale, 0, Math.PI * 2);
  ctx.arc(x + 25 * scale, y + 5 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround(ctx, w, h, darkMode) {
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
      ctx.ellipse(50 + i * 150, h - 28, 40, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ground line
  ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h - 30);
  ctx.lineTo(w, h - 30);
  ctx.stroke();

  // Grass tufts
  if (!darkMode) {
    ctx.strokeStyle = 'rgba(90, 150, 60, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 20; i++) {
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

  // Shadow under tree
  if (!darkMode) {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h - 28, 80, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTree(ctx, w, h, darkMode) {
  const trunkColor = darkMode ? '#3d2b1f' : '#5D4037';
  const branchColor = darkMode ? '#4a3728' : '#6D4C41';
  const leafColor1 = darkMode ? '#1a3a1a' : '#4CAF50';
  const leafColor2 = darkMode ? '#0d2b0d' : '#388E3C';

  // Trunk
  ctx.fillStyle = trunkColor;
  ctx.beginPath();
  ctx.moveTo(w * 0.48, h - 30);
  ctx.lineTo(w * 0.52, h - 30);
  ctx.lineTo(w * 0.51, h * 0.55);
  ctx.lineTo(w * 0.49, h * 0.55);
  ctx.closePath();
  ctx.fill();

  // Trunk texture lines
  ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const ty = h * 0.65 + i * 40;
    ctx.beginPath();
    ctx.moveTo(w * 0.49, ty);
    ctx.lineTo(w * 0.505, ty - 5);
    ctx.stroke();
  }

  // Main branch going right
  ctx.strokeStyle = branchColor;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.55);
  ctx.quadraticCurveTo(w * 0.62, h * 0.4, w * 0.7, h * 0.3);
  ctx.stroke();

  // Sub branch going up-right
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w * 0.6, h * 0.4);
  ctx.quadraticCurveTo(w * 0.68, h * 0.3, w * 0.75, h * 0.22);
  ctx.stroke();

  // Branch going left
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.55);
  ctx.quadraticCurveTo(w * 0.38, h * 0.45, w * 0.3, h * 0.35);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w * 0.38, h * 0.48);
  ctx.quadraticCurveTo(w * 0.3, h * 0.4, w * 0.25, h * 0.33);
  ctx.stroke();

  // Thin twigs
  ctx.lineWidth = 3;
  ctx.strokeStyle = branchColor;
  ctx.beginPath();
  ctx.moveTo(w * 0.7, h * 0.3);
  ctx.quadraticCurveTo(w * 0.75, h * 0.28, w * 0.8, h * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.65, h * 0.35);
  ctx.quadraticCurveTo(w * 0.7, h * 0.32, w * 0.76, h * 0.3);
  ctx.stroke();

  // Leaf clusters
  const sway = Math.sin(Date.now() / 2000) * 2;

  drawLeafCluster(ctx, w * 0.72 + sway * 0.5, h * 0.28, 60, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.3 + sway * 0.3, h * 0.33, 50, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.78 + sway * 0.5, h * 0.22, 45, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.5 + sway * 0.2, h * 0.5, 40, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.38 + sway * 0.3, h * 0.45, 35, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.65 + sway * 0.4, h * 0.38, 35, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.25 + sway * 0.2, h * 0.32, 30, leafColor1, leafColor2);

  // Tiny leaf details on twigs
  drawLeafCluster(ctx, w * 0.82 + sway * 0.5, h * 0.24, 25, leafColor1, leafColor2);
  drawLeafCluster(ctx, w * 0.76 + sway * 0.4, h * 0.29, 20, leafColor1, leafColor2);
}

function drawLeafCluster(ctx, x, y, size, color1, color2) {
  ctx.save();
  const layers = 4;
  for (let i = layers; i >= 0; i--) {
    const r = size * (0.3 + i * 0.15);
    const alpha = 0.5 + i * 0.1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? color1 : color2;
    ctx.globalAlpha = Math.min(alpha, 0.8);
    ctx.fill();
  }
  ctx.restore();
}

function drawApple(ctx, apple, w, h, isDragging, darkMode) {
  if (!apple) return;

  const { x, y } = apple.position;
  const angle = apple.angle;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Apple shadow
  ctx.beginPath();
  ctx.ellipse(2, 2, 18, 16, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fill();

  // Apple body
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

  // Apple highlight
  ctx.beginPath();
  ctx.ellipse(-5, -6, 4, 6, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();

  // Apple stem
  ctx.strokeStyle = darkMode ? '#5D4037' : '#4a3728';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.quadraticCurveTo(3, -24, 4, -26);
  ctx.stroke();

  // Apple leaf
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.ellipse(5, -24, 6, 3, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Glow when dragging
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

function drawConstraints(ctx, engine) {
  const constraints = engine.world.constraints;
  if (!constraints) return;

  constraints.forEach((constraint) => {
    if (constraint.bodyB) {
      const posA = constraint.pointA;
      const posB = constraint.bodyB.position;
      ctx.beginPath();
      ctx.moveTo(
        (constraint.bodyA ? constraint.bodyA.position.x : 0) + posA.x,
        (constraint.bodyA ? constraint.bodyA.position.y : 0) + posA.y
      );
      ctx.lineTo(
        (constraint.bodyA ? constraint.bodyA.position.x : 0) + posB.x,
        (constraint.bodyA ? constraint.bodyA.position.y : 0) + posB.y
      );
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
}

function drawWindParticles(ctx, windForce, w, h) {
  if (Math.abs(windForce) < 0.1) return;

  ctx.fillStyle = `rgba(200, 220, 255, ${Math.min(Math.abs(windForce) * 0.05, 0.3)})`;
  for (let i = 0; i < Math.abs(windForce) * 3; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wind lines
  ctx.strokeStyle = `rgba(200, 220, 255, ${Math.min(Math.abs(windForce) * 0.03, 0.2)})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < Math.abs(windForce) * 2; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + windForce * 5, y);
    ctx.stroke();
  }
}

function drawLeaves(ctx, w, h, time) {
  const leafCount = 3;
  for (let i = 0; i < leafCount; i++) {
    const phase = (time * 0.5 + i * 2) % (Math.PI * 4);
    const x = w * 0.5 + Math.sin(phase * 0.5) * 100;
    const y = h * 0.3 + phase * 15;
    const alpha = Math.max(0, 1 - phase / (Math.PI * 4));

    if (alpha > 0 && y < h - 30) {
      ctx.fillStyle = `rgba(76, 175, 80, ${alpha * 0.4})`;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(phase);
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

export default SimulationCanvas;
