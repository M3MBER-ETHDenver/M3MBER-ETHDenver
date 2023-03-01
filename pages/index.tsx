import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, { useState } from "react";
import InputEns from '../components/inputEns';
import LoginCard from '../components/communitySpace/LoginCard';

export default function Home({...props}) {

  return (
    <div className={styles.container} style={{ overflow: "hidden"}
    }>
      <Head>
        <title>ORG3 </title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{display: "flex", justifyContent: "center", alignContent: "center", marginTop: "120px"}}>
          <LoginCard></LoginCard>
      </div>
      

    </div>
  )
}