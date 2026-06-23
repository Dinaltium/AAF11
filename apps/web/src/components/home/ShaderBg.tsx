'use client';

/**
 * Orange "waterPlane" shader gradient — the section-2 background.
 * Config per the approved ShaderGradient preset (charcoal → orange → amber).
 * Loaded client-only (WebGL); paused to `animate="off"` under reduced motion.
 *
 * Props are spread from a plain object: the library accepts more runtime props
 * (fov, cameraZoom, frameRate, …) than its exported prop types declare.
 */

import React from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export default function ShaderBg({ animate }: { animate: boolean }) {
  const props = {
    control: 'props',
    animate: animate ? 'on' : 'off',
    type: 'waterPlane',
    shader: 'defaults',
    color1: '#0b0c0f',
    color2: '#ff7a1a',
    color3: '#ffc233',
    brightness: 1.2,
    reflection: 0.1,
    lightType: 'env',
    envPreset: 'lobby',
    grain: 'off',
    cAzimuthAngle: 180,
    cPolarAngle: 90,
    cDistance: 2.74,
    cameraZoom: 1,
    fov: 50,
    positionX: -1.4,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 10,
    rotationZ: 50,
    uAmplitude: 1,
    uDensity: 1,
    uFrequency: 5.5,
    uSpeed: 0.3,
    uStrength: 2.1,
    uTime: 0,
    pixelDensity: 0.3,
    frameRate: 10,
  };

  return (
    <ShaderGradientCanvas style={{ width: '100%', height: '100%' }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ShaderGradient {...(props as any)} />
    </ShaderGradientCanvas>
  );
}
