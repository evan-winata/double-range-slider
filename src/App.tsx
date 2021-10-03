import React from 'react';
import classes from "./App.module.scss";
import { DoubleRangeSlider } from './components/DoubleRangeSlider';

function App() {
  return (
    <div className={classes.app}>
      <div className={classes.sampleRow}>
        <h3 className={classes.title}>Sample normal slider</h3>
        <DoubleRangeSlider id="sample" min="0" max="80" lowValue={25} highValue={50} />      
      </div>
      <div className={classes.sampleRow}>
        <h3 className={classes.title}>Sample slider with minimum range set between the thumbs</h3>
        <DoubleRangeSlider id="sampleMin" min="10" max="50" lowValue={15} highValue={40} minRange={5} />      
      </div>
      <div className={classes.sampleRow}>
        <h3 className={classes.title}>Sample slider with unit</h3>
        <DoubleRangeSlider id="sampleUnit" min="25" max="150" lowValue={55} highValue={100} unit="cm" />      
      </div>
    </div>
  );
}

export default App;
