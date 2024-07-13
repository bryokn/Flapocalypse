import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const PIPE_WIDTH = 65;
const PIPE_GAP = 200;
const PIPE_SPEED = 2;
const PIPE_SPACING = 300; //Pipe spacing 

const App = () => {
  const [birdY, setBirdY] = useState(HEIGHT / 2 - BIRD_HEIGHT / 2);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const gravity = useRef(0.5);
  const birdJump = useRef(-10);
  const passedPipeIds = useRef(new Set());

  useEffect(() => {
    loadHighScore();
  }, []);

  useEffect(() => {
    if (!gameActive) return;

    const gameLoop = requestAnimationFrame(updateGameState);
    return () => cancelAnimationFrame(gameLoop);
  }, [gameActive, birdY, pipes, score]);

  const loadHighScore = async () => {
    try {
      const value = await AsyncStorage.getItem('@highScore');
      if (value !== null) {
        setHighScore(parseInt(value));
      }
    } catch (error) {
      console.error('Error loading high score:', error);
    }
  };

  const saveHighScore = async (newHighScore) => {
    try {
      await AsyncStorage.setItem('@highScore', newHighScore.toString());
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  const resetGame = () => {
    if (score > highScore) {
      setHighScore(score);
      saveHighScore(score);
    }
    setBirdY(HEIGHT / 2 - BIRD_HEIGHT / 2);
    setPipes([]);
    setScore(0);
    setGameActive(true);
    passedPipeIds.current.clear();
  };

  const generatePipe = () => {
    const gapStart = Math.random() * (HEIGHT - PIPE_GAP - 100) + 50;
    const color = PIPE_COLORS[Math.floor(Math.random() * PIPE_COLORS.length)];
    return { id: Date.now(), x: WIDTH, gapStart, color };
  };

  const updateGameState = () => {
    const newBirdY = birdY + gravity.current;
    let newPipes = [...pipes];
    let newScore = score;

    // Generate new pipes
    if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < WIDTH - PIPE_SPACING) {
      newPipes.push(generatePipe());
    }

    // Move pipes and update score
    newPipes = newPipes.map((pipe) => {
      const newX = pipe.x - PIPE_SPEED;
      if (newX + PIPE_WIDTH < 50 && !passedPipeIds.current.has(pipe.id)) {
        newScore += 1;
        passedPipeIds.current.add(pipe.id);
      }
      return { ...pipe, x: newX };
    });

    // Remove passed pipes
    newPipes = newPipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0);

    // Check for collisions
    const birdRect = { x: 50, y: newBirdY, width: BIRD_WIDTH, height: BIRD_HEIGHT };
    const collision = newPipes.some((pipe) => {
      const upperPipe = { x: pipe.x, y: 0, width: PIPE_WIDTH, height: pipe.gapStart };
      const lowerPipe = { x: pipe.x, y: pipe.gapStart + PIPE_GAP, width: PIPE_WIDTH, height: HEIGHT - pipe.gapStart - PIPE_GAP };
      return checkCollision(birdRect, upperPipe) || checkCollision(birdRect, lowerPipe);
    });

    if (collision) {
      setGameActive(false);
    } else {
      setBirdY(newBirdY);
      setPipes(newPipes);
      setScore(newScore);
    }
  };

  const checkCollision = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  const handleTouch = () => {
    if (gameActive) {
      setBirdY((prevY) => prevY + birdJump.current);
    } else {
      resetGame();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      <View style={styles.container}>
        <Image
          source={require('./assets/bird.png')}
          style={[styles.bird, { top: birdY }]}
        />
        {pipes.map((pipe, index) => (
          <React.Fragment key={pipe.id}>
            <View
              style={[
                styles.pipe,
                { left: pipe.x, height: pipe.gapStart, backgroundColor: pipe.color },
              ]}
            />
            <View
              style={[
                styles.pipe,
                {
                  left: pipe.x,
                  top: pipe.gapStart + PIPE_GAP,
                  height: HEIGHT - pipe.gapStart - PIPE_GAP,
                  backgroundColor: pipe.color,
                },
              ]}
            />
          </React.Fragment>
        ))}
        <Text style={styles.score}>{score}</Text>
        {!gameActive && (
          <View style={styles.endScreen}>
            <Text style={styles.endScreenText}>Game Over</Text>
            <Text style={styles.endScreenScore}>Score: {score}</Text>
            <Text style={styles.endScreenHighScore}>High Score: {highScore}</Text>
            {score > highScore && (
              <Text style={styles.newHighScoreText}>New High Score!</Text>
            )}
            <Text style={styles.endScreenInstructions}>Tap to restart</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'skyblue',
  },
  bird: {
    position: 'absolute',
    left: 50,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
  },
  pipe: {
    position: 'absolute',
    width: PIPE_WIDTH,
  },
  score: {
    position: 'absolute',
    top: 50,
    left: 20,
    fontSize: 40,
    fontWeight: 'bold',
    color: 'black',
  },
  endScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  endScreenText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  endScreenScore: {
    fontSize: 30,
    color: 'white',
    marginBottom: 10,
  },
  endScreenHighScore: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
  },
  newHighScoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'gold',
    marginBottom: 20,
  },
  endScreenInstructions: {
    fontSize: 20,
    color: 'white',
  },
});

const PIPE_COLORS = [
  'green',
  'blue',
  'red',
  'yellow',
  'magenta',
  'cyan',
  'purple',
  'orange',
];

export default App;
