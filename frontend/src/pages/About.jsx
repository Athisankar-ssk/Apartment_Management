import React from "react";
import Navbar from "../components/Navbar";
import "./Home.css";

function About() {
  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1>About</h1>
        <p>About this apartment management app</p>
      </div>
    </>
  );
}

export default About;
