// import React, { useState, useEffect, useRef } from 'react';
// import { StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions, Image, SafeAreaView, StatusBar } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const { width: WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// const HEIGHT = SCREEN_HEIGHT - StatusBar.currentHeight;

// const BIRD_WIDTH = 40;
// const BIRD_HEIGHT = 30;
// const PIPE_WIDTH = 65;
// const PIPE_GAP = 200;
// const PIPE_SPACING = 300;
// const POWER_UP_SIZE = 30;
// const POWER_UP_TYPES = ['invincibility', 'slowMotion', 'magnet'];
// const POWER_UP_DURATION = 5000; // 5 seconds

// interface PowerUp {
//   id: number;
//   x: number;
//   y: number;
//   type: 'invincibility' | 'slowMotion' | 'magnet';
//   image: any;
// }

// const getPowerUpColor = (type: PowerUp['type']): string => {
//   switch (type) {
//     case 'invincibility':
//       return 'purple';
//     case 'slowMotion':
//       return 'blue';
//     case 'magnet':
//       return 'red';
//     default:
//       return 'gray';
//   }
// };

// const App = () => {
//   const [birdY, setBirdY] = useState(HEIGHT / 2 - BIRD_HEIGHT / 2);
//   const [pipes, setPipes] = useState([]);
//   const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
//   const [coins, setCoins] = useState([]);
//   const [score, setScore] = useState(0);
//   const [coinsCollected, setCoinsCollected] = useState(0);
//   const [highScore, setHighScore] = useState(0);
//   const [gameActive, setGameActive] = useState(true);
//   const [activePowerUp, setActivePowerUp] = useState<PowerUp['type'] | null>(null);
//   const gravity = useRef(0.5);
//   const birdJump = useRef(-10);
//   const passedPipeIds = useRef(new Set());

//   useEffect(() => {
//     loadHighScore();
//   }, []);

//   useEffect(() => {
//     if (!gameActive) return;

//     const gameLoop = requestAnimationFrame(updateGameState);
//     return () => cancelAnimationFrame(gameLoop);
//   }, [gameActive, birdY, pipes, powerUps, coins, score, activePowerUp]);

//   const loadHighScore = async () => {
//     try {
//       const value = await AsyncStorage.getItem('@highScore');
//       if (value !== null) {
//         setHighScore(parseInt(value));
//       }
//     } catch (error) {
//       console.error('Error loading high score:', error);
//     }
//   };

//   const saveHighScore = async (newHighScore: number) => {
//     try {
//       await AsyncStorage.setItem('@highScore', newHighScore.toString());
//     } catch (error) {
//       console.error('Error saving high score:', error);
//     }
//   };

//   const resetGame = () => {
//     if (score > highScore) {
//       setHighScore(score);
//       saveHighScore(score);
//     }
//     setBirdY(HEIGHT / 2 - BIRD_HEIGHT / 2);
//     setPipes([]);
//     setPowerUps([]);
//     setCoins([]);
//     setScore(0);
//     setCoinsCollected(0);
//     setGameActive(true);
//     setActivePowerUp(null);
//     passedPipeIds.current.clear();
//   };

//   const generatePipe = () => {
//     const gapStart = Math.random() * (HEIGHT - PIPE_GAP - 100) + 50;
//     const color = PIPE_COLORS[Math.floor(Math.random() * PIPE_COLORS.length)];
//     return { id: Date.now(), x: WIDTH, gapStart, color };
//   };

//   const generatePowerUp = (): PowerUp => {
//     const type = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)] as PowerUp['type'];
//     let image;
//     switch (type) {
//       case 'invincibility':
//         image = require('./assets/invincible.png');
//         break;
//       case 'slowMotion':
//         image = require('./assets/slowMotion.png');
//         break;
//       case 'magnet':
//         image = require('./assets/magnet.png');
//         break;
//     }

//     return {
//       id: Date.now(),
//       x: WIDTH,
//       y: Math.random() * (HEIGHT - POWER_UP_SIZE),
//       type,
//       image,
//     };
//   };

//   const generateCoin = () => {
//     return {
//       id: Date.now(),
//       x: WIDTH,
//       y: Math.random() * (HEIGHT - POWER_UP_SIZE),
//     };
//   };

//   const activatePowerUp = (type: PowerUp['type']) => {
//     setActivePowerUp(type);
//     setTimeout(() => {
//       setActivePowerUp(null);
//     }, POWER_UP_DURATION);
//   };

//   const updateGameState = () => {
//     const PIPE_SPEED = activePowerUp === 'slowMotion' ? 1 : 2;
//     const newBirdY = birdY + gravity.current;
//     let newPipes = [...pipes];
//     let newPowerUps = [...powerUps];
//     let newCoins = [...coins];
//     let newScore = score;

//     // Generate new pipes
//     if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < WIDTH - PIPE_SPACING) {
//       newPipes.push(generatePipe());
//     }

//     // Generate new power-ups
//     if (Math.random() < 0.005) {
//       newPowerUps.push(generatePowerUp());
//     }

//     // Generate new coins
//     if (Math.random() < 0.02) {
//       newCoins.push(generateCoin());
//     }

//     // Move pipes and update score
//     newPipes = newPipes.map((pipe) => {
//       const newX = pipe.x - PIPE_SPEED;
//       if (newX + PIPE_WIDTH < 50 && !passedPipeIds.current.has(pipe.id)) {
//         newScore += 1;
//         passedPipeIds.current.add(pipe.id);
//       }
//       return { ...pipe, x: newX };
//     });

//     // Remove passed pipes
//     newPipes = newPipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0);

//     // Move power-ups and check for collisions
//     newPowerUps = newPowerUps.map((powerUp) => {
//       const newX = powerUp.x - PIPE_SPEED;
//       if (checkCollision(
//         { x: 50, y: newBirdY, width: BIRD_WIDTH, height: BIRD_HEIGHT },
//         { x: newX, y: powerUp.y, width: POWER_UP_SIZE, height: POWER_UP_SIZE }
//       )) {
//         activatePowerUp(powerUp.type);
//         return null;
//       }
//       return { ...powerUp, x: newX };
//     }).filter(Boolean) as PowerUp[];

//     // Move coins and check for collisions
//     newCoins = newCoins.map((coin) => {
//       const newX = coin.x - PIPE_SPEED;
//       if (checkCollision(
//         { x: 50, y: newBirdY, width: BIRD_WIDTH, height: BIRD_HEIGHT },
//         { x: newX, y: coin.y, width: POWER_UP_SIZE, height: POWER_UP_SIZE }
//       )) {
//         setCoinsCollected(prev => prev + 1);
//         return null;
//       }
//       return { ...coin, x: newX };
//     }).filter(Boolean);

//     // Apply magnet effect
//     if (activePowerUp === 'magnet') {
//       newCoins = newCoins.map((coin) => {
//         const dx = 50 - coin.x;
//         const dy = newBirdY - coin.y;
//         const distance = Math.sqrt(dx * dx + dy * dy);
//         if (distance < 100) {
//           return {
//             ...coin,
//             x: coin.x + dx / 10,
//             y: coin.y + dy / 10,
//           };
//         }
//         return coin;
//       });
//     }

//     // Check for collisions
//     const birdRect = { x: 50, y: newBirdY, width: BIRD_WIDTH, height: BIRD_HEIGHT };
//     const collision = newPipes.some((pipe) => {
//       const upperPipe = { x: pipe.x, y: 0, width: PIPE_WIDTH, height: pipe.gapStart };
//       const lowerPipe = { x: pipe.x, y: pipe.gapStart + PIPE_GAP, width: PIPE_WIDTH, height: HEIGHT - pipe.gapStart - PIPE_GAP };
//       return checkCollision(birdRect, upperPipe) || checkCollision(birdRect, lowerPipe);
//     });

//     if ((collision && activePowerUp !== 'invincibility') || newBirdY <= 0 || newBirdY + BIRD_HEIGHT >= HEIGHT) {
//       setGameActive(false);
//     } else {
//       setBirdY(newBirdY);
//       setPipes(newPipes);
//       setPowerUps(newPowerUps);
//       setCoins(newCoins);
//       setScore(newScore);
//     }
//   };

//   const checkCollision = (rect1, rect2) => {
//     return (
//       rect1.x < rect2.x + rect2.width &&
//       rect1.x + rect1.width > rect2.x &&
//       rect1.y < rect2.y + rect2.height &&
//       rect1.y + rect1.height > rect2.y
//     );
//   };

//   const handleTouch = () => {
//     if (gameActive) {
//       setBirdY((prevY) => prevY + birdJump.current);
//     } else {
//       resetGame();
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <TouchableWithoutFeedback onPress={handleTouch}>
//         <View style={styles.container}>
//           <Image
//             source={require('./assets/bird.png')}
//             style={[styles.bird, { top: birdY }]}
//           />
//           {pipes.map((pipe) => (
//             <React.Fragment key={pipe.id}>
//               <View
//                 style={[
//                   styles.pipe,
//                   { left: pipe.x, height: pipe.gapStart, backgroundColor: pipe.color },
//                 ]}
//               />
//               <View
//                 style={[
//                   styles.pipe,
//                   {
//                     left: pipe.x,
//                     top: pipe.gapStart + PIPE_GAP,
//                     height: HEIGHT - pipe.gapStart - PIPE_GAP,
//                     backgroundColor: pipe.color,
//                   },
//                 ]}
//               />
//             </React.Fragment>
//           ))}
//           {/* {powerUps.map((powerUp) => (
//             <View
//               key={powerUp.id}
//               style={[
//                 styles.powerUp,
//                 { left: powerUp.x, top: powerUp.y, backgroundColor: getPowerUpColor(powerUp.type) },
//               ]}
//             />
//           ))} */}

//             {powerUps.map((powerUp) => (
//             <Image
//               key={powerUp.id}
//               source={powerUp.image}
//               style={[
//                 styles.powerUp,
//                 { left: powerUp.x, top: powerUp.y },
//               ]}
//             />
//             ))}
//           {coins.map((coin) => (
//             <Image
//               key={coin.id}
//               source={require('./assets/coin.png')}
//               style={[
//                 styles.coin,
//                 { left: coin.x, top: coin.y },
//               ]}
//             />
//           ))}
//           <Text style={styles.score}>{score}</Text>
//           <Text style={styles.coinsCollected}>Coins: {coinsCollected}</Text>
//           {activePowerUp && (
//             <Text style={styles.activePowerUp}>{activePowerUp}</Text>
//           )}
//           {!gameActive && (
//             <View style={styles.endScreen}>
//               <Text style={styles.endScreenText}>Game Over</Text>
//               <Text style={styles.endScreenScore}>Score: {score}</Text>
//               <Text style={styles.endScreenCoins}>Coins: {coinsCollected}</Text>
//               <Text style={styles.endScreenHighScore}>High Score: {highScore}</Text>
//               {score > highScore && (
//                 <Text style={styles.newHighScoreText}>New High Score!</Text>
//               )}
//               <Text style={styles.endScreenInstructions}>Tap to restart</Text>
//             </View>
//           )}
//         </View>
//       </TouchableWithoutFeedback>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: 'skyblue',
//   },
//   container: {
//     flex: 1,
//     position: 'relative',
//   },
//   bird: {
//     position: 'absolute',
//     left: 50,
//     width: BIRD_WIDTH,
//     height: BIRD_HEIGHT,
//   },
//   pipe: {
//     position: 'absolute',
//     width: PIPE_WIDTH,
//   },
//   powerUp: {
//     position: 'absolute',
//     width: POWER_UP_SIZE,
//     height: POWER_UP_SIZE,
//     // borderRadius: POWER_UP_SIZE / 2,
//   },
//   coin: {
//     position: 'absolute',
//     width: POWER_UP_SIZE,
//     height: POWER_UP_SIZE,
//   },
//   score: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     fontSize: 40,
//     fontWeight: 'bold',
//     color: 'black',
//   },
//   coinsCollected: {
//     position: 'absolute',
//     top: 90,
//     left: 20,
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'black',
//   },
//   activePowerUp: {
//     position: 'absolute',
//     top: 130,
//     left: 20,
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   endScreen: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   endScreenText: {
//     fontSize: 40,
//     fontWeight: 'bold',
//     color: 'white',
//     marginBottom: 20,
//   },
//   endScreenScore: {
//     fontSize: 30,
//     color: 'white',
//     marginBottom: 10,
//   },
//   endScreenCoins: {
//     fontSize: 24,
//     color: 'gold',
//     marginBottom: 10,
//   },
//   endScreenHighScore: {
//     fontSize: 24,
//     color: 'white',
//     marginBottom: 10,
//   },
//   newHighScoreText: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: 'gold',
//     marginBottom: 20,
//   },
//   endScreenInstructions: {
//     fontSize: 20,
//     color: 'white',
//   },
// });

// const PIPE_COLORS = [
//   'green',
//   'blue',
//   'red',
//   'yellow',
//   'magenta',
//   'cyan',
//   'purple',
//   'orange',
// ];

// export default App;