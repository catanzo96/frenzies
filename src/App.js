import React, {useState, useEffect} from 'react';
import Die from './components/Die';
import {nanoid} from 'nanoid';
import Confetti from 'react-confetti';
import { motion } from "framer-motion";

export default function App() {
  const [dice, setDice] = useState(allNewDice());
  const [frenzies, setFrenzies] = useState(false);
  const [startGame, setStartGame] = useState(true);
  const [count, setCount] = useState(0);

  let score;
  const checkScore = +localStorage.getItem('score');
  if (checkScore) {
    score = checkScore;
  } else {
    score = "N/D";
  }

  useEffect(() => {
    const allHeld = dice.every(die => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every(die => die.value === firstValue);
    if (allHeld && allSameValue) {
      setFrenzies(true);
    }
  }, [dice]);

  function allNewDice() {
    const newDice = [];
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDice())
    }
    return newDice;
  };

  function generateNewDice() {
    return ({
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid()
    })
  };

  function rollDice() {
    if (!frenzies) {
      setStartGame(false);
      setCount(count + 1);
      setDice(oldDice => oldDice.map(die => {
        return die.isHeld ?
          die :
          generateNewDice()
      }));
    } else {
      const oldScore = +localStorage.getItem('score');
      if (oldScore && oldScore <= count) {
        localStorage.setItem('score', JSON.stringify(oldScore))
      } else if (oldScore && oldScore > count || !oldScore) {
        localStorage.setItem('score', JSON.stringify(count))
      };
      setStartGame(true);
      setFrenzies(false);
      setCount(0);
      setDice(allNewDice);
    };
  };

  function holdDice(id) {
      setDice(oldDice => oldDice.map(die => {
        return die.id === id ?
          {...die, isHeld: !die.isHeld} :
          die
      }))
  };

  const diceElements = dice.map(die => (
    <Die key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      holdDice={() => holdDice(die.id)}
      />
  ));

  return (
    <motion.div
      animate={{opacity: 1}}
      initial={{opacity: 0}}
      exit={{opacity: 0}}
      transition={{duration: 1}}>
      <main>
        {frenzies && <Confetti />}
        <h1 className='title' translate="no">Frenzies</h1>
        <p className='instruction'>Roll until all dice are the same. Click on die to lock it at its current value.</p>
        {startGame ? 
          <div className='space'></div> 
          :
        <motion.div
          animate={{opacity: 1}}
          initial={{opacity: 0}}
          exit={{opacity: 0}}
          transition={{duration: 1}}
          className='dice-container'>
            {diceElements}
        </motion.div>
        }

        <button
          className='roll-dice'
          onClick={rollDice}>
          {frenzies ? 'New Game' :
            startGame ? 'Start' : 'Roll'}
        </button>
        <div className='score'>
          <p><b>Corrent Score:</b> {count}</p>
          <p><b>Best Score:</b> {score}</p>
        </div>
      </main>
    </motion.div>
  )
}
