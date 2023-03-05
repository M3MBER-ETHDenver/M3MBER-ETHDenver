import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, { useState } from "react";
import InputEns from '../components/inputEns';
import LoginCard from '../components/communitySpace/LoginCard';

export default function Home({ ...props }) {

  return (
    <div className={styles.container} style={{
      overflow: "hidden",
      backgroundImage: "url(/background.png)",
      backgroundSize: "cover",
      backgroundColor: "#4E86F7",
      width: "100vw",
      height: "850px",
      minHeight: "100vh"
    }
    }>
      <Head>
        <title>M3MBER </title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className='landing-page'
        style={{
          display: "flex", justifyContent: "start", alignContent: "center", marginTop: 160, marginLeft: 100
        }}>
        <LoginCard></LoginCard>
      </div>


    </div>
  )
}
