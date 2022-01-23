import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import {
  convertSeasonCodes,
  generateApiString,
  gameStates,
  getRadomNumberWithMax,
  questions,
  calculateWinner,
} from '../../helpers';
import {
  Loading,
  Results,
  GameEnd,
  SpecialEvent,
  Score,
  Guessing,
} from '../../components';

const Game = () => {
  const { state } = useLocation();
  const [seasonCodes, setSeasonCodes] = useState([]);
  const [housemateData, setHousemateData] = useState(null);
  const [specialEventsData, setSpecialEventsData] = useState(null);
  const [gameStatus, setGameStatus] = useState();

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const baseUrl = 'https://terrace-house-server.herokuapp.com/';

  useEffect(() => {
    if (state) {
      const temp = [];
      state.seasons.forEach((season) => {
        temp.push(convertSeasonCodes(season));
      });
      setSeasonCodes(temp);
    }
  }, []);

  useEffect(() => {
    const getHousemateData = async () => {
      let housemateData = await axios.get(
        `${baseUrl}housemates/${generateApiString(seasonCodes)}`
      );
      let eventData = await axios.get(
        `${baseUrl}effects/${generateApiString(seasonCodes)}`
      );

      setHousemateData(housemateData.data);
      setSpecialEventsData(eventData.data);
      setGameStatus(gameStates.GUESSING);
    };

    if (seasonCodes.length > 0) {
      getHousemateData();
    }
  }, [seasonCodes]);

  const updateScore = (value, positive) => {
    let newScore = score;
    positive ? (newScore += value) : (newScore -= value);
    setScore(newScore);
  };

  const updateLives = (positive) => {
    let newLifeCount = lives;
    positive ? newLifeCount++ : newLifeCount--;
    if (newLifeCount <= 0) {
      setGameStatus(gameStates.END);
    }

    setLives(newLifeCount);
  };

  const createRoundData = () => {
    let question = questions[getRadomNumberWithMax(questions.length - 1)];
    const housemateOne =
      housemateData[getRadomNumberWithMax(housemateData.length - 1)];
    let housemateTwo =
      housemateData[getRadomNumberWithMax(housemateData.length - 1)];

    while (housemateTwo.housematename === housemateOne.housematename) {
      housemateTwo =
        housemateData[getRadomNumberWithMax(housemateData.length - 1)];
    }

    let draw;

    switch (question.id) {
      case 0:
        draw =
          housemateOne.weeksinhouse === housemateTwo.weeksinhouse
            ? true
            : false;
        break;
      case 1:
        draw = housemateOne.dates === housemateTwo.dates ? true : false;
        break;
      case 2:
        draw = housemateOne.agenow === housemateTwo.agenow ? true : false;
        break;
      case 3:
        draw =
          housemateOne.agewhenentered === housemateTwo.agewhenentered
            ? true
            : false;
        break;
      case 4:
        draw =
          housemateOne.instagramfollowers === housemateTwo.instagramfollowers
            ? true
            : false;
        break;
      case 5:
        draw = housemateOne.livedwith === housemateTwo.livedwith ? true : false;
        break;

      default:
        break;
    }
    console.log(draw);
    if (draw) {
      // TODO Handle a draw.
    }

    const winner = calculateWinner(housemateOne, housemateTwo, question.id);

    const output = {
      housemateOne: housemateOne,
      housemateTwo: housemateTwo,
      question: question,
      winner: winner,
    };

    return output;
  };

  const renderGameComponent = () => {
    switch (gameStatus) {
      case gameStates.GUESSING:
        return <Guessing roundData={createRoundData()} />;
      case gameStates.RESULTS:
        return <Results winner={false} />;
      case gameStates.LOADING:
        return <Loading />;
      case gameStates.SPECIALEVENT:
        return (
          <SpecialEvent
            eventInfo={
              specialEventsData[
                Math.ceil(Math.random() * specialEventsData.length)
              ]
            }
            updateScore={updateScore}
            updateLives={updateLives}
          />
        );
      case gameStates.END:
        return <GameEnd score={score} streak={69} />;

      default:
        return <h1>Default</h1>;
    }
  };

  const updateGameStatus = (newStatus) => {
    setGameStatus(newStatus);
  };

  //
  return (
    <>
      <Score score={score} />
      <p>Lives: {lives}</p>

      {seasonCodes ? (
        renderGameComponent()
      ) : (
        <h1>Opps, no data was passed in.</h1>
      )}
    </>
  );
};

export default Game;
