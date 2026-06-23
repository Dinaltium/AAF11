import React from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import styles from '@/components/home/home.module.css';
import SmoothScroll from '@/components/home/SmoothScroll';
import Opening from '@/components/home/Opening';
import Trio from '@/components/home/Trio';
import Capabilities from '@/components/home/Capabilities';
import TrackRecord from '@/components/home/TrackRecord';
import Edge from '@/components/home/Edge';
import CTA from '@/components/home/CTA';

export default function Home() {
  return (
    <div className={`${GeistSans.variable} ${GeistMono.variable} ${styles.root}`}>
      <SmoothScroll>
        <Opening />
        <Trio />
        <Capabilities />
        <TrackRecord />
        <Edge />
        <CTA />
      </SmoothScroll>
    </div>
  );
}
