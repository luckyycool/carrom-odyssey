import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PhysicsEngine, type Puck, type Vector2D } from './physics';
import { CandyEffectsManager } from './particles';
import { getLevel, type LevelData } from './levels';
import {
  INITIAL_BOARD_THEMES,
  INITIAL_STRIKERS,
  INITIAL_PUCK_SKINS,
} from '../state/gameStore';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Trophy,
  Target,
  Crown,
  Pause,
  Play,
  Home,
  Gift,
  Settings,
} from 'lucide-react';

export interface CarromBoardProps {
  mode?: 'campaign' | 'pass_and_play' | 'ai_match' | 'daily' | 'zen';
  levelNumber: number;
  selectedBoardThemeId: string;
  selectedStrikerId: string;
  selectedPuckSkinId: string;
  strikerCharge?: number;
  strikerLevel?: number;
  isProUser?: boolean;
  onConsumePowder?: () => void;
  coins?: number;
  stars?: number;
  onOpenSettings?: () => void;
  onWinLevel: (level: number, strikesRemaining: number, score: number) => void;
  onRestartLevel: () => void;
  onExitToHome: () => void;
  onRequestSecondChanceAd?: () => void;
  onRequestDoubleRewardAd?: () => void;
}

export const CarromBoard: React.FC<CarromBoardProps> = ({
  mode = 'campaign',
  levelNumber,
  selectedBoardThemeId,
  selectedStrikerId,
  selectedPuckSkinId,
  strikerCharge,
  strikerLevel = 1,
  isProUser = false,
  onConsumePowder,
  onOpenSettings,
  onWinLevel,
  onRestartLevel,
  onExitToHome,
  onRequestSecondChanceAd,
  onRequestDoubleRewardAd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Powder and Upgrade Status
  const isPowderActive = isProUser || (strikerCharge !== undefined ? strikerCharge > 0 : true) || selectedStrikerId === 'standard_cyan';
  const hasConsumedPowderRef = useRef<boolean>(false);

  // Active Cosmetics Resolution
  const activeBoardTheme =
    INITIAL_BOARD_THEMES.find(b => b.id === selectedBoardThemeId) || INITIAL_BOARD_THEMES[0];
  const activeStrikerSkin =
    INITIAL_STRIKERS.find(s => s.id === selectedStrikerId) || INITIAL_STRIKERS[0];
  const activePuckSkin =
    INITIAL_PUCK_SKINS.find(p => p.id === selectedPuckSkinId) || INITIAL_PUCK_SKINS[0];

  const [currentLevel, setCurrentLevel] = useState<LevelData>(getLevel(levelNumber));
  const [strikesLeft, setStrikesLeft] = useState<number>(
    mode === 'zen' ? 999 : currentLevel.maxStrikes
  );
  const [pucksLeft, setPucksLeft] = useState<number>(currentLevel.targetCount);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameState, setGameState] = useState<'aiming' | 'simulating' | 'rotating' | 'won' | 'lost'>('aiming');
  const [statusMessage, setStatusMessage] = useState<string>('Drag & flick striker to shoot!');

  // Multiplayer / AI Match state
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [activePlayer, setActivePlayer] = useState<'P1' | 'P2'>('P1');

  // Queen state: 'on_board' | 'pending_cover' | 'covered'
  const [queenState, setQueenState] = useState<'on_board' | 'pending_cover' | 'covered'>('on_board');
  const queenPendingCoverRef = useRef<boolean>(false);
  const queenCoveredRef = useRef<boolean>(false);

  // Striker baseline slider: 0.0 to 1.0 (always on the bottom baseline)
  const [strikerPosRatio, setStrikerPosRatio] = useState<number>(0.5);

  // Smooth rotation visual angle (radians)
  const visualAngleRef = useRef<number>(0);
  const rotationProgressRef = useRef<{ startAngle: number; targetAngle: number; startTime: number } | null>(null);

  // Drag & direct-touch state
  const dragStartRef = useRef<Vector2D | null>(null);
  const dragCurrentRef = useRef<Vector2D | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const pointerInteractionRef = useRef<{
    mode: 'none' | 'sliding' | 'aiming';
    touchOrigin: Vector2D;
    initialRatio: number;
  }>({ mode: 'none', touchOrigin: { x: 0, y: 0 }, initialRatio: 0.5 });

  // Engines
  const physicsRef = useRef<PhysicsEngine | null>(null);
  const effectsRef = useRef<CandyEffectsManager>(new CandyEffectsManager());
  const animationFrameRef = useRef<number | null>(null);

  // Track pucks pocketed during the current strike
  const pucksPocketedThisTurnRef = useRef<Puck[]>([]);
  const strikerFouledRef = useRef<boolean>(false);

  // Find a baseline position that does NOT overlap with any existing puck
  const getSafeBaselinePos = useCallback((ratio: number, engine: PhysicsEngine): { x: number; y: number; validRatio: number } => {
    const w = engine.boardWidth;
    const h = engine.boardHeight;
    const baselineOffset = engine.margin + 70;
    const minP = engine.margin + 75;
    const maxP = w - engine.margin - 75;
    const y = h - baselineOffset;
    const strikerRadius = 21;

    const isBlocked = (candidateX: number) => {
      for (const p of engine.pucks) {
        if (p.isPocketed || p.type === 'striker') continue;
        const dist = Math.hypot(p.x - candidateX, p.y - y);
        if (dist < strikerRadius + p.radius + 4) {
          return true;
        }
      }
      return false;
    };

    const targetX = minP + (maxP - minP) * ratio;
    if (!isBlocked(targetX)) {
      return { x: targetX, y, validRatio: ratio };
    }

    for (let offset = 4; offset <= (maxP - minP); offset += 4) {
      const leftX = targetX - offset;
      if (leftX >= minP && !isBlocked(leftX)) {
        return { x: leftX, y, validRatio: (leftX - minP) / (maxP - minP) };
      }
      const rightX = targetX + offset;
      if (rightX <= maxP && !isBlocked(rightX)) {
        return { x: rightX, y, validRatio: (rightX - minP) / (maxP - minP) };
      }
    }

    return { x: targetX, y, validRatio: ratio };
  }, []);

  // Map touch screen coords to canvas coordinates (accounting for visual rotation)
  const screenToCanvasCoords = useCallback((screenX: number, screenY: number, canvas: HTMLCanvasElement): Vector2D => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const rawX = (screenX - rect.left) * scaleX;
    const rawY = (screenY - rect.top) * scaleY;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dx = rawX - cx;
    const dy = rawY - cy;
    const angle = -visualAngleRef.current;

    return {
      x: cx + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: cy + dx * Math.sin(angle) + dy * Math.cos(angle),
    };
  }, []);

  // Initialize or reset level
  useEffect(() => {
    const lvl = getLevel(levelNumber);
    setCurrentLevel(lvl);
    setStrikesLeft(mode === 'zen' ? 999 : lvl.maxStrikes);
    setPucksLeft(lvl.targetCount);
    setCombo(0);
    setGameState('aiming');
    setIsPaused(false);
    setStatusMessage(
      mode === 'pass_and_play'
        ? "Player 1's Turn (White)"
        : mode === 'ai_match'
        ? 'Your Turn (White)'
        : mode === 'zen'
        ? 'Zen Free-Play: Infinite Strikes'
        : `Level ${lvl.levelNumber}: ${lvl.title}`
    );
    visualAngleRef.current = 0;
    rotationProgressRef.current = null;
    pucksPocketedThisTurnRef.current = [];
    strikerFouledRef.current = false;

    // Queen status
    const hasQueen = lvl.pucks.some(p => p.type === 'queen');
    if (hasQueen) {
      queenPendingCoverRef.current = false;
      queenCoveredRef.current = false;
      setQueenState('on_board');
    } else {
      queenPendingCoverRef.current = false;
      queenCoveredRef.current = true;
      setQueenState('covered');
    }

    const boardDim = 600 * lvl.boardScale;
    const engine = new PhysicsEngine(boardDim, boardDim);
    engine.friction = lvl.friction;
    engine.globalGravity = lvl.globalGravity;
    engine.magnets = lvl.magnets;
    engine.obstacles = lvl.obstacles;

    // Spawn pucks with chosen puck skin
    lvl.pucks.forEach(p => {
      const created = engine.createPuck(p.type, p.x, p.y);
      if (p.type === 'white') {
        created.color = activePuckSkin.whiteColor;
        created.borderColor = activePuckSkin.whiteBorder;
      } else if (p.type === 'queen') {
        created.color = activePuckSkin.queenColor;
        created.borderColor = activePuckSkin.queenBorder;
      }
    });

    // Spawn striker with chosen striker skin
    const safe = getSafeBaselinePos(0.5, engine);
    setStrikerPosRatio(safe.validRatio);
    const striker = engine.createPuck('striker', safe.x, safe.y);
    striker.color = activeStrikerSkin.color;
    striker.borderColor = activeStrikerSkin.borderColor;
    striker.mass = activeStrikerSkin.mass;

    physicsRef.current = engine;
  }, [
    levelNumber,
    mode,
    activeBoardTheme,
    activeStrikerSkin,
    activePuckSkin,
    getSafeBaselinePos,
  ]);

  // AI Turn Autonomous Execution
  useEffect(() => {
    if (mode === 'ai_match' && activePlayer === 'P2' && gameState === 'aiming' && !isPaused) {
      const timer = setTimeout(() => {
        const engine = physicsRef.current;
        if (!engine) return;

        const striker = engine.pucks.find(p => p.type === 'striker');
        const targetPuck = engine.pucks.find(p => !p.isPocketed && p.type !== 'striker');
        if (!striker || !targetPuck) return;

        // AI aims towards nearest target puck
        const dx = targetPuck.x - striker.x;
        const dy = targetPuck.y - striker.y;
        const dist = Math.hypot(dx, dy);

        // Moderate realistic AI strike power
        const speed = 6.5 + Math.random() * 5.0;
        striker.vx = (dx / (dist + 0.1)) * speed;
        striker.vy = (dy / (dist + 0.1)) * speed;

        sounds.playFlick(0.6);
        triggerHaptic.medium();
        pucksPocketedThisTurnRef.current = [];
        strikerFouledRef.current = false;
        setGameState('simulating');
        setStatusMessage("AI Bot's strike in motion!");
      }, 1100);

      return () => clearTimeout(timer);
    }
  }, [mode, activePlayer, gameState, isPaused]);

  // Main Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pulseTime = 0;

    const renderLoop = () => {
      pulseTime += 0.05;
      const engine = physicsRef.current;
      const effects = effectsRef.current;

      if (!engine || isPaused) {
        animationFrameRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Handle 90° Clockwise Board Rotation Animation
      if (rotationProgressRef.current) {
        const { startAngle, targetAngle, startTime } = rotationProgressRef.current;
        const elapsed = performance.now() - startTime;
        const duration = 400;

        if (elapsed < duration) {
          const t = elapsed / duration;
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          visualAngleRef.current = startAngle + (targetAngle - startAngle) * ease;
        } else {
          rotationProgressRef.current = null;
          visualAngleRef.current = 0;

          engine.rotateWorld90Clockwise();

          const striker = engine.pucks.find(p => p.type === 'striker');
          if (striker) {
            const safe = getSafeBaselinePos(strikerPosRatio, engine);
            setStrikerPosRatio(safe.validRatio);
            striker.x = safe.x;
            striker.y = safe.y;
            striker.vx = 0;
            striker.vy = 0;
            striker.scale = 1.0;
            striker.isPocketed = false;
          }

          pucksPocketedThisTurnRef.current = [];
          strikerFouledRef.current = false;
          setGameState('aiming');
          setStatusMessage('Ready for next shot!');
        }
      }

      // Physics Simulation Step
      if (gameState === 'simulating') {
        const striker = engine.pucks.find(p => p.type === 'striker');
        if (striker && !striker.isPocketed) {
          const speed = Math.hypot(striker.vx, striker.vy);
          effects.addStrikerTrail(striker.x, striker.y, speed);
        }

        engine.update((puck) => {
          if (puck.type === 'striker') {
            strikerFouledRef.current = true;
            triggerHaptic.heavy();
            sounds.playFoulSound();
            setStatusMessage('FOUL! Striker Pocketed!');
          } else {
            pucksPocketedThisTurnRef.current.push(puck);
            const newCombo = combo + 1;
            setCombo(newCombo);
            setScore(prev => prev + (puck.type === 'queen' ? 500 : 100) * newCombo);
            setPucksLeft(prev => Math.max(0, prev - 1));

            if (mode === 'pass_and_play' || mode === 'ai_match') {
              if (activePlayer === 'P1') setP1Score(prev => prev + 100);
              else setP2Score(prev => prev + 100);
            }

            sounds.playSweetCombo(newCombo);
            triggerHaptic.heavy();
            effects.addPuckSinkExplosion(puck.x, puck.y, newCombo);

            if (puck.type === 'queen') {
              confetti({ particleCount: 40, spread: 70, origin: { y: 0.55 } });
            }
          }
        });

        // Movement stopped check
        if (!engine.isBoardMoving()) {
          engine.stopResidualMotion();

          const striker = engine.pucks.find(p => p.type === 'striker');
          const isFouled = striker?.isPocketed || strikerFouledRef.current;
          const targetPucksSunkThisTurn = pucksPocketedThisTurnRef.current.filter(p => p.type !== 'striker');
          const queenSunkThisTurn = targetPucksSunkThisTurn.some(p => p.type === 'queen');
          const whiteSunkThisTurn = targetPucksSunkThisTurn.some(p => p.type === 'white' || p.type === 'black');
          const hasQueenInLevel = currentLevel.pucks.some(p => p.type === 'queen');

          // ==========================================
          // CASE 1: FOUL (Striker Pocketed)
          // ==========================================
          if (isFouled) {
            if (queenPendingCoverRef.current || queenSunkThisTurn) {
              const queen = engine.pucks.find(p => p.type === 'queen');
              if (queen) {
                queen.isPocketed = false;
                queen.scale = 1.0;
                queen.vx = 0;
                queen.vy = 0;
                queen.x = engine.boardWidth / 2;
                queen.y = engine.boardHeight / 2;
              }
              queenPendingCoverRef.current = false;
              setQueenState('on_board');
            }

            // Penalty due: Return 1 White/Black puck
            let returnedPuck: Puck | undefined;
            if (whiteSunkThisTurn) {
              returnedPuck = targetPucksSunkThisTurn.find(p => p.type === 'white' || p.type === 'black');
            } else {
              returnedPuck = engine.pucks.find(p => p.isPocketed && (p.type === 'white' || p.type === 'black'));
            }

            if (returnedPuck) {
              returnedPuck.isPocketed = false;
              returnedPuck.scale = 1.0;
              returnedPuck.vx = 0;
              returnedPuck.vy = 0;
              const cx = engine.boardWidth / 2;
              const cy = engine.boardHeight / 2;
              returnedPuck.x = cx + (Math.random() - 0.5) * 30;
              returnedPuck.y = cy + (Math.random() - 0.5) * 30;
            }

            const remainingPucks = engine.pucks.filter(p => !p.isPocketed && p.type !== 'striker');
            setPucksLeft(remainingPucks.length);

            setCombo(0);
            const remaining = strikesLeft - 1;
            if (mode !== 'zen') setStrikesLeft(remaining);
            sounds.playFoulSound();
            triggerHaptic.heavy();

            const isMultiplayer = mode === 'pass_and_play' || mode === 'ai_match';
            if (isMultiplayer) {
              setActivePlayer(prev => (prev === 'P1' ? 'P2' : 'P1'));
            }

            if (remaining <= 0 && mode !== 'zen') {
              setGameState('lost');
              setStatusMessage('Out of strikes! (Foul)');
              return;
            }

            if (isMultiplayer) {
              setStatusMessage('FOUL! Penalty: Puck returned to center');
              setGameState('rotating');
              sounds.playRotateWhoosh();
              rotationProgressRef.current = {
                startAngle: 0,
                targetAngle: Math.PI / 2,
                startTime: performance.now(),
              };
            } else {
              if (striker) {
                const safe = getSafeBaselinePos(strikerPosRatio, engine);
                setStrikerPosRatio(safe.validRatio);
                striker.x = safe.x;
                striker.y = safe.y;
                striker.vx = 0;
                striker.vy = 0;
                striker.scale = 1.0;
                striker.isPocketed = false;
              }
              setGameState('aiming');
              setStatusMessage('FOUL! Penalty puck returned to center.');
            }
            strikerFouledRef.current = false;
            pucksPocketedThisTurnRef.current = [];
            return;
          }

          // ==========================================
          // CASE 2: CLEAN SHOT (No Foul)
          // ==========================================

          if (queenPendingCoverRef.current) {
            if (whiteSunkThisTurn) {
              queenPendingCoverRef.current = false;
              queenCoveredRef.current = true;
              setQueenState('covered');
              setScore(prev => prev + 500);
              sounds.playSweetCombo(combo + 2);
              confetti({ particleCount: 50, spread: 75, origin: { y: 0.55 } });
              setStatusMessage('👑 QUEEN COVERED! Excellent shot!');
            } else {
              const queen = engine.pucks.find(p => p.type === 'queen');
              if (queen) {
                queen.isPocketed = false;
                queen.scale = 1.0;
                queen.vx = 0;
                queen.vy = 0;
                queen.x = engine.boardWidth / 2;
                queen.y = engine.boardHeight / 2;
              }
              queenPendingCoverRef.current = false;
              setQueenState('on_board');
              setPucksLeft(prev => prev + 1);

              setCombo(0);
              const remaining = strikesLeft - 1;
              if (mode !== 'zen') setStrikesLeft(remaining);
              setStatusMessage('Queen not covered! Returned to center.');

              const isMultiplayer = mode === 'pass_and_play' || mode === 'ai_match';
              if (isMultiplayer) {
                setActivePlayer(prev => (prev === 'P1' ? 'P2' : 'P1'));
              }

              if (remaining <= 0 && mode !== 'zen') {
                setGameState('lost');
                return;
              }

              if (isMultiplayer) {
                setGameState('rotating');
                sounds.playRotateWhoosh();
                rotationProgressRef.current = {
                  startAngle: 0,
                  targetAngle: Math.PI / 2,
                  startTime: performance.now(),
                };
              } else {
                if (striker) {
                  const safe = getSafeBaselinePos(strikerPosRatio, engine);
                  setStrikerPosRatio(safe.validRatio);
                  striker.x = safe.x;
                  striker.y = safe.y;
                  striker.vx = 0;
                  striker.vy = 0;
                  striker.scale = 1.0;
                  striker.isPocketed = false;
                }
                setGameState('aiming');
              }
              strikerFouledRef.current = false;
              pucksPocketedThisTurnRef.current = [];
              return;
            }
          } else if (queenSunkThisTurn) {
            if (whiteSunkThisTurn) {
              queenCoveredRef.current = true;
              setQueenState('covered');
              setScore(prev => prev + 500);
              sounds.playSweetCombo(combo + 2);
              confetti({ particleCount: 60, spread: 80, origin: { y: 0.55 } });
              setStatusMessage('👑 QUEEN & COVER IN ONE SHOT!');
            } else {
              queenPendingCoverRef.current = true;
              setQueenState('pending_cover');
              setStatusMessage('👑 Queen Pocketed! Pocket a White puck next to COVER!');
            }
          }

          // Rule 2: Queen cannot be left alone on board
          const remainingWhite = engine.pucks.filter(
            p => !p.isPocketed && (p.type === 'white' || p.type === 'black')
          );
          const isQueenStillOnBoard = engine.pucks.some(p => !p.isPocketed && p.type === 'queen');

          if (remainingWhite.length === 0 && isQueenStillOnBoard) {
            const lastWhite = targetPucksSunkThisTurn.find(
              p => p.type === 'white' || p.type === 'black'
            );
            if (lastWhite) {
              lastWhite.isPocketed = false;
              lastWhite.scale = 1.0;
              lastWhite.vx = 0;
              lastWhite.vy = 0;
              lastWhite.x = engine.boardWidth / 2 + 35;
              lastWhite.y = engine.boardHeight / 2;
              setPucksLeft(prev => prev + 1);
            }
            sounds.playFoulSound();
            setStatusMessage('Rule: Queen must be pocketed before last puck!');
          }

          // Check Win Condition
          const unpocketedTargets = engine.pucks.filter(p => !p.isPocketed && p.type !== 'striker');
          const queenRequirementMet = !hasQueenInLevel || queenCoveredRef.current;

          if (unpocketedTargets.length === 0 && queenRequirementMet) {
            setGameState('won');
            sounds.playLevelClear();
            triggerHaptic.success();
            confetti({ particleCount: 140, spread: 100, origin: { y: 0.5 } });
            onWinLevel(currentLevel.levelNumber, strikesLeft, score);
            return;
          }

          // Choice B: Rotate ONLY on Miss in Multiplayer!
          if (targetPucksSunkThisTurn.length > 0) {
            if (striker) {
              const safe = getSafeBaselinePos(strikerPosRatio, engine);
              setStrikerPosRatio(safe.validRatio);
              striker.x = safe.x;
              striker.y = safe.y;
              striker.vx = 0;
              striker.vy = 0;
              striker.scale = 1.0;
              striker.isPocketed = false;
            }
            pucksPocketedThisTurnRef.current = [];
            strikerFouledRef.current = false;
            setGameState('aiming');
            if (queenPendingCoverRef.current) {
              setStatusMessage('👑 Queen Pocketed! Pocket any White puck now to COVER!');
            } else {
              setStatusMessage('Nice shot! Continue your streak!');
            }
          } else {
            // MISS: Deduct strike
            setCombo(0);
            const remaining = strikesLeft - 1;
            if (mode !== 'zen') setStrikesLeft(remaining);

            const isMultiplayer = mode === 'pass_and_play' || mode === 'ai_match';
            if (isMultiplayer) {
              setActivePlayer(prev => (prev === 'P1' ? 'P2' : 'P1'));
            }

            if (remaining <= 0 && mode !== 'zen') {
              setGameState('lost');
              setStatusMessage('Out of strikes! Try again.');
              return;
            }

            if (isMultiplayer) {
              setGameState('rotating');
              setStatusMessage('Missed! Turn passing...');
              sounds.playRotateWhoosh();
              triggerHaptic.light();

              rotationProgressRef.current = {
                startAngle: 0,
                targetAngle: Math.PI / 2,
                startTime: performance.now(),
              };
            } else {
              if (striker) {
                const safe = getSafeBaselinePos(strikerPosRatio, engine);
                setStrikerPosRatio(safe.validRatio);
                striker.x = safe.x;
                striker.y = safe.y;
                striker.vx = 0;
                striker.vy = 0;
                striker.scale = 1.0;
                striker.isPocketed = false;
              }
              setGameState('aiming');
              setStatusMessage('Missed! Try again.');
            }
            strikerFouledRef.current = false;
            pucksPocketedThisTurnRef.current = [];
          }
        }
      }

      effects.update();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(visualAngleRef.current);
      ctx.translate(-cx, -cy);

      drawBoardSurface(ctx, engine, pulseTime);
      drawMagnetsAndGravity(ctx, engine, pulseTime);
      drawObstacles(ctx, engine, pulseTime);
      drawPucks(ctx, engine);

      if (
        gameState === 'aiming' &&
        isDraggingRef.current &&
        pointerInteractionRef.current.mode === 'aiming' &&
        dragStartRef.current &&
        dragCurrentRef.current
      ) {
        drawAimGuide(ctx, dragStartRef.current, dragCurrentRef.current, engine);
      }

      effects.render(ctx);

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    gameState,
    combo,
    strikesLeft,
    strikerPosRatio,
    getSafeBaselinePos,
    currentLevel.pucks,
    isPaused,
    mode,
    activePlayer,
    onWinLevel,
  ]);

  // Pointer / Touch aiming & Direct Baseline Sliding
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'aiming' || isPaused) return;
    if (mode === 'ai_match' && activePlayer === 'P2') return;

    const canvas = canvasRef.current;
    const engine = physicsRef.current;
    if (!canvas || !engine) return;

    const boardPos = screenToCanvasCoords(e.clientX, e.clientY, canvas);
    const striker = engine.pucks.find(p => p.type === 'striker');
    if (!striker || striker.isPocketed) return;

    const baselineY = engine.boardHeight - (engine.margin + 70);
    const minP = engine.margin + 75;
    const maxP = engine.boardWidth - engine.margin - 75;
    const distToStriker = Math.hypot(boardPos.x - striker.x, boardPos.y - striker.y);
    const isNearBaseline =
      Math.abs(boardPos.y - baselineY) < 38 && boardPos.x >= minP - 25 && boardPos.x <= maxP + 25;

    if (distToStriker < striker.radius * 2.6) {
      // Direct touch on/near striker: start undecided (will choose sliding or aiming on move)
      isDraggingRef.current = true;
      pointerInteractionRef.current = {
        mode: 'none',
        touchOrigin: boardPos,
        initialRatio: strikerPosRatio,
      };
      dragStartRef.current = { x: striker.x, y: striker.y };
      dragCurrentRef.current = { x: striker.x, y: striker.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      triggerHaptic.light();
    } else if (isNearBaseline) {
      // Direct touch along baseline: snap striker here and slide!
      const targetRatio = Math.max(0.05, Math.min(0.95, (boardPos.x - minP) / (maxP - minP)));
      const safe = getSafeBaselinePos(targetRatio, engine);
      setStrikerPosRatio(safe.validRatio);
      striker.x = safe.x;
      striker.y = safe.y;
      striker.vx = 0;
      striker.vy = 0;

      isDraggingRef.current = true;
      pointerInteractionRef.current = {
        mode: 'sliding',
        touchOrigin: boardPos,
        initialRatio: safe.validRatio,
      };
      dragStartRef.current = { x: safe.x, y: safe.y };
      dragCurrentRef.current = { x: safe.x, y: safe.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      triggerHaptic.light();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || gameState !== 'aiming' || isPaused) return;
    const canvas = canvasRef.current;
    const engine = physicsRef.current;
    if (!canvas || !engine) return;

    const boardPos = screenToCanvasCoords(e.clientX, e.clientY, canvas);
    const striker = engine.pucks.find(p => p.type === 'striker');
    if (!striker) return;

    const interaction = pointerInteractionRef.current;
    const dx = boardPos.x - interaction.touchOrigin.x;
    const dy = boardPos.y - interaction.touchOrigin.y;

    if (interaction.mode === 'none') {
      const dist = Math.hypot(dx, dy);
      if (dist > 7) {
        // Pulling down/backwards or any steep angle => aiming mode
        if (dy > 6 || Math.abs(dy) > Math.abs(dx) * 0.75) {
          interaction.mode = 'aiming';
        } else if (Math.abs(dx) > Math.abs(dy) * 1.1) {
          // Horizontal drag along baseline => sliding mode
          interaction.mode = 'sliding';
        } else {
          interaction.mode = 'aiming';
        }
      }
    }

    if (interaction.mode === 'sliding') {
      const minP = engine.margin + 75;
      const maxP = engine.boardWidth - engine.margin - 75;
      const targetRatio = Math.max(0.05, Math.min(0.95, (boardPos.x - minP) / (maxP - minP)));
      const safe = getSafeBaselinePos(targetRatio, engine);
      setStrikerPosRatio(safe.validRatio);
      striker.x = safe.x;
      striker.y = safe.y;
      striker.vx = 0;
      striker.vy = 0;
      dragStartRef.current = { x: safe.x, y: safe.y };
      dragCurrentRef.current = { x: safe.x, y: safe.y };
    } else if (interaction.mode === 'aiming') {
      dragCurrentRef.current = boardPos;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || gameState !== 'aiming' || isPaused) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const engine = physicsRef.current;
    const interaction = pointerInteractionRef.current;
    if (!engine) return;

    if (interaction.mode === 'aiming' && dragStartRef.current && dragCurrentRef.current) {
      const striker = engine.pucks.find(p => p.type === 'striker');
      if (!striker) return;

      const dx = dragStartRef.current.x - dragCurrentRef.current.x;
      const dy = dragStartRef.current.y - dragCurrentRef.current.y;
      const pullDist = Math.hypot(dx, dy);

      if (pullDist > 6) {
        if (!hasConsumedPowderRef.current) {
          hasConsumedPowderRef.current = true;
          onConsumePowder?.();
        }

        const maxPull = 120;
        const clampedPull = Math.min(pullDist, maxPull);
        const powerRatio = clampedPull / maxPull;

        // Authentic tournament striker strike speed (smoothly ranges from 2.5 to 24.5 px/frame)
        const levelSpeedBonus = 1 + (strikerLevel - 1) * 0.03; // Gentle 3% per level
        const maxStrikerSpeed = (activeStrikerSkin.trait === '+30% Mass' ? 22.5 : 24.5) * (isPowderActive ? levelSpeedBonus : 0.88);
        const speed = 2.5 + Math.pow(powerRatio, 1.05) * (maxStrikerSpeed - 2.5);

        striker.vx = (dx / pullDist) * speed;
        striker.vy = (dy / pullDist) * speed;

        sounds.playFlick(powerRatio);
        triggerHaptic.medium();

        pucksPocketedThisTurnRef.current = [];
        strikerFouledRef.current = false;
        setGameState('simulating');
        setStatusMessage('Shot in motion!');
      }
    } else if (interaction.mode === 'sliding') {
      triggerHaptic.light();
    }

    pointerInteractionRef.current = { mode: 'none', touchOrigin: { x: 0, y: 0 }, initialRatio: 0.5 };
    dragStartRef.current = null;
    dragCurrentRef.current = null;
  };

  // Drawing Helpers
  const drawBoardSurface = (ctx: CanvasRenderingContext2D, engine: PhysicsEngine, pulse: number) => {
    const w = engine.boardWidth;
    const h = engine.boardHeight;
    const m = engine.margin;

    // 1. Outer Hardwood Board Frame
    ctx.fillStyle = activeBoardTheme.frameColor;
    ctx.fillRect(0, 0, w, h);

    // Frame corner miters & dark border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, w - 3, h - 3);

    // 2. Inner Playing Surface (Polished Smooth Plywood)
    ctx.fillStyle = activeBoardTheme.surfaceColor;
    ctx.fillRect(m, m, w - m * 2, h - m * 2);

    // Subtle natural wood grain lines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.022)';
    for (let y = m + 4; y < h - m; y += 7) {
      ctx.fillRect(m, y, w - m * 2, 1.5);
    }

    // 3. Wooden Cushions with Beveled 3D Lighting (inner edge precisely matches physics boundary m)
    ctx.fillStyle = activeBoardTheme.cushionColor;
    ctx.fillRect(m - 10, m - 10, w - (m - 10) * 2, 10);
    ctx.fillRect(m - 10, h - m, w - (m - 10) * 2, 10);
    ctx.fillRect(m - 10, m - 10, 10, h - (m - 10) * 2);
    ctx.fillRect(w - m, m - 10, 10, h - (m - 10) * 2);

    // Inner cushion bevel highlights along exact physics edge m
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(m, m);
    ctx.lineTo(w - m, m);
    ctx.moveTo(m, m);
    ctx.lineTo(m, h - m);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.moveTo(m, h - m);
    ctx.lineTo(w - m, h - m);
    ctx.moveTo(w - m, m);
    ctx.lineTo(w - m, h - m);
    ctx.stroke();

    // 4. Center Ornate ICF Star & Lotus Mandala
    const cx = w / 2;
    const cy = h / 2;
    ctx.save();

    // Outer ICF Center Circle Ring (~7.6cm regulation = ~52px radius)
    ctx.strokeStyle = activeBoardTheme.mandalaColor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 54, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.stroke();

    // 8-Petaled Lotus Floral Mandala
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const petalDist = 34;
      const px = cx + Math.cos(angle) * petalDist;
      const py = cy + Math.sin(angle) * petalDist;

      ctx.beginPath();
      ctx.arc(px, py, 11, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(220, 20, 60, 0.35)' : 'rgba(212, 175, 55, 0.28)';
      ctx.fill();
      ctx.strokeStyle = activeBoardTheme.mandalaColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Center Queen Placement Circle (Solid Red Circle ~3.18cm = ~18px radius)
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#C62828';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner Gold Pin Dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();

    // 4 ICF Quadrant Direction Arrows pointing towards corner pockets
    const arrowAngles = [
      Math.PI * 0.25, // Bottom-Right
      Math.PI * 0.75, // Bottom-Left
      Math.PI * 1.25, // Top-Left
      Math.PI * 1.75, // Top-Right
    ];

    for (const a of arrowAngles) {
      const startR = 64;
      const endR = 120;
      const ax1 = cx + Math.cos(a) * startR;
      const ay1 = cy + Math.sin(a) * startR;
      const ax2 = cx + Math.cos(a) * endR;
      const ay2 = cy + Math.sin(a) * endR;

      // Stem
      ctx.strokeStyle = 'rgba(180, 45, 35, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ax1, ay1);
      ctx.lineTo(ax2, ay2);
      ctx.stroke();

      // Base circle
      ctx.beginPath();
      ctx.arc(ax1, ay1, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220, 20, 60, 0.6)';
      ctx.fill();

      // Arrowhead
      const headLen = 11;
      const leftA = a + Math.PI - 0.42;
      const rightA = a + Math.PI + 0.42;
      ctx.beginPath();
      ctx.moveTo(ax2, ay2);
      ctx.lineTo(ax2 + Math.cos(leftA) * headLen, ay2 + Math.sin(leftA) * headLen);
      ctx.lineTo(ax2 + Math.cos(rightA) * headLen, ay2 + Math.sin(rightA) * headLen);
      ctx.closePath();
      ctx.fillStyle = 'rgba(180, 45, 35, 0.85)';
      ctx.fill();
    }
    ctx.restore();

    // 5. Baselines and Authentic ICF Base Circles
    const baselineOffset = m + 70;
    const minP = m + 75;
    const maxP = w - m - 75;

    ctx.strokeStyle = 'rgba(180, 50, 40, 0.65)';
    ctx.lineWidth = 2;

    const drawSideBaseline = (x1: number, y1: number, x2: number, y2: number) => {
      // Parallel guide baseline
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Regulation Base Circles at ends
      const drawBaseCircle = (bx: number, by: number) => {
        ctx.beginPath();
        ctx.arc(bx, by, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 64, 129, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(180, 50, 40, 0.8)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Inner solid red center dot
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#C62828';
        ctx.fill();
      };

      drawBaseCircle(x1, y1);
      drawBaseCircle(x2, y2);
    };

    drawSideBaseline(minP, h - baselineOffset, maxP, h - baselineOffset);
    drawSideBaseline(baselineOffset, minP, baselineOffset, maxP);
    drawSideBaseline(minP, baselineOffset, maxP, baselineOffset);
    drawSideBaseline(w - baselineOffset, minP, w - baselineOffset, maxP);

    // Active baseline glowing track
    ctx.save();
    ctx.strokeStyle = activeBoardTheme.glowColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = activeBoardTheme.glowColor;
    ctx.shadowBlur = 12 + Math.sin(pulse * 2.5) * 4;
    ctx.beginPath();
    ctx.moveTo(minP, h - baselineOffset);
    ctx.lineTo(maxP, h - baselineOffset);
    ctx.stroke();
    ctx.restore();

    // 7. Recessed Pockets with Realistic Depth, Interior Mesh Netting & Metallic Rims
    for (const pocket of engine.pockets) {
      ctx.save();

      // Deep radial gradient cavity
      const pocketGrad = ctx.createRadialGradient(
        pocket.x,
        pocket.y,
        3,
        pocket.x,
        pocket.y,
        pocket.radius
      );
      pocketGrad.addColorStop(0, '#030205');
      pocketGrad.addColorStop(0.65, '#0b080f');
      pocketGrad.addColorStop(0.9, '#181220');
      pocketGrad.addColorStop(1, '#251b30');
      ctx.fillStyle = pocketGrad;
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
      ctx.fill();

      // Interior netting mesh lines (clipped inside pocket)
      ctx.save();
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, pocket.radius - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = 'rgba(215, 190, 150, 0.18)';
      ctx.lineWidth = 1.2;
      const step = 8;
      for (let nx = pocket.x - pocket.radius - step; nx <= pocket.x + pocket.radius + step; nx += step) {
        ctx.beginPath();
        ctx.moveTo(nx, pocket.y - pocket.radius);
        ctx.lineTo(nx + pocket.radius, pocket.y + pocket.radius);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(nx, pocket.y + pocket.radius);
        ctx.lineTo(nx + pocket.radius, pocket.y - pocket.radius);
        ctx.stroke();
      }
      ctx.restore();

      // Metallic Rim & Drop Shadow
      ctx.strokeStyle = activeBoardTheme.pocketRimColor;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Brass Corner Screw Rivet in outer frame
      const cornerX = pocket.x < cx ? m - 16 : w - m + 16;
      const cornerY = pocket.y < cy ? m - 16 : h - m + 16;
      ctx.fillStyle = '#D4AF37';
      ctx.beginPath();
      ctx.arc(cornerX, cornerY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7D5A12';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  };

  const drawMagnetsAndGravity = (ctx: CanvasRenderingContext2D, engine: PhysicsEngine, pulse: number) => {
    if (engine.globalGravity.y > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
      const spacing = 80;
      const yOffset = (pulse * 25) % spacing;

      for (let x = engine.margin + 60; x < engine.boardWidth - engine.margin - 40; x += spacing) {
        for (let y = engine.margin + 60; y < engine.boardHeight - engine.margin - 40; y += spacing) {
          const dy = y + yOffset;
          if (dy < engine.boardHeight - engine.margin - 50) {
            ctx.beginPath();
            ctx.moveTo(x, dy);
            ctx.lineTo(x + 8, dy - 8);
            ctx.lineTo(x - 8, dy - 8);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    for (const mag of engine.magnets) {
      ctx.save();
      const isAttract = mag.strength > 0;
      const ringColor = isAttract ? 'rgba(255, 64, 129,' : 'rgba(0, 229, 255,';

      for (let r = 20; r < mag.radius; r += 45) {
        const ringPulse = (r + pulse * 20) % mag.radius;
        const alpha = Math.max(0, 0.4 * (1 - ringPulse / mag.radius));

        ctx.beginPath();
        ctx.arc(mag.x, mag.y, ringPulse, 0, Math.PI * 2);
        ctx.strokeStyle = `${ringColor} ${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(mag.x, mag.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = isAttract ? '#FF1744' : '#00E5FF';
      ctx.shadowColor = isAttract ? '#FF4081' : '#00E5FF';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.restore();
    }
  };

  const drawObstacles = (ctx: CanvasRenderingContext2D, engine: PhysicsEngine, pulse: number) => {
    for (const obs of engine.obstacles) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFA000';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 10 + Math.sin(pulse * 3) * 5;
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  };

  const drawPucks = (ctx: CanvasRenderingContext2D, engine: PhysicsEngine) => {
    for (const p of engine.pucks) {
      if (p.isPocketed && p.scale <= 0.05) continue;

      ctx.save();
      const currentRadius = p.radius * p.scale;

      ctx.beginPath();
      ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = p.borderColor;
      ctx.stroke();

      if (p.type === 'queen') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#B71C1C';
        ctx.fill();
      } else if (p.type === 'striker') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }

      ctx.restore();
    }
  };

  const drawAimGuide = (
    ctx: CanvasRenderingContext2D,
    start: Vector2D,
    current: Vector2D,
    engine: PhysicsEngine
  ) => {
    const dx = start.x - current.x;
    const dy = start.y - current.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) return;

    const angle = Math.atan2(dy, dx);
    const maxPull = 130;
    const clampedDist = Math.min(dist, maxPull);
    const powerRatio = clampedDist / maxPull;

    const r = Math.floor(powerRatio * 255);
    const g = Math.floor((1 - powerRatio * 0.7) * 230);
    const b = Math.floor((1 - powerRatio) * 100);
    const aimColor = `rgb(${r}, ${g}, ${b})`;

    ctx.save();

    // 1. Slingshot pull band behind striker
    ctx.setLineDash([]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(current.x, current.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = aimColor;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Raycasting Trajectory with 1-Bounce Cushion Reflection & Puck Deflection
    const strikerRadius = 21;
    const isLaser = activeStrikerSkin.id === 'laser_pointer' && isPowderActive;
    const aimLevelMultiplier = 1 + (strikerLevel - 1) * 0.12;
    // Calibrated aim guide: shows responsive path from close taps to full board reaches
    const baseRange = isPowderActive ? (120 + powerRatio * 180) * aimLevelMultiplier : 95 + powerRatio * 90;
    const totalRange = isLaser ? 800 : baseRange;

    // Inner cushion collision boundaries (aligns exactly with PhysicsEngine margin)
    const cushionMargin = engine.margin;
    const minX = cushionMargin + strikerRadius;
    const maxX = engine.boardWidth - cushionMargin - strikerRadius;
    const minY = cushionMargin + strikerRadius;
    const maxY = engine.boardHeight - cushionMargin - strikerRadius;

    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    const findPuckHit = (ox: number, oy: number, vx: number, vy: number, maxT: number) => {
      let closestHit: { t: number; puck: Puck } | null = null;
      for (const p of engine.pucks) {
        if (p.isPocketed || p.type === 'striker') continue;
        const px = p.x - ox;
        const py = p.y - oy;
        const proj = px * vx + py * vy;
        if (proj <= 5) continue;

        const perpSq = px * px + py * py - proj * proj;
        const colRadius = strikerRadius + p.radius;
        if (perpSq < colRadius * colRadius) {
          const tHit = proj - Math.sqrt(Math.max(0, colRadius * colRadius - perpSq));
          if (tHit > 2 && tHit <= maxT) {
            if (!closestHit || tHit < closestHit.t) {
              closestHit = { t: tHit, puck: p };
            }
          }
        }
      }
      return closestHit;
    };

    const findCushionHit = (ox: number, oy: number, vx: number, vy: number) => {
      let tx = Infinity;
      let ty = Infinity;

      if (vx > 0.0001) tx = (maxX - ox) / vx;
      else if (vx < -0.0001) tx = (minX - ox) / vx;

      if (vy > 0.0001) ty = (maxY - oy) / vy;
      else if (vy < -0.0001) ty = (minY - oy) / vy;

      const tCushion = Math.min(tx, ty);
      const isVertical = tx < ty;
      return { t: tCushion > 0 ? tCushion : Infinity, isVertical };
    };

    const drawImpactArrow = (hitX: number, hitY: number, puck: Puck) => {
      // Ghost striker circle
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(hitX, hitY, strikerRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Deflection vector on target puck
      const defX = puck.x - hitX;
      const defY = puck.y - hitY;
      const defDist = Math.hypot(defX, defY) || 1;
      const nx = defX / defDist;
      const ny = defY / defDist;
      const arrowLen = 40;

      ctx.setLineDash([]);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(puck.x, puck.y);
      ctx.lineTo(puck.x + nx * arrowLen, puck.y + ny * arrowLen);
      ctx.stroke();

      const headLen = 8;
      const arrowAngle = Math.atan2(ny, nx);
      ctx.beginPath();
      ctx.moveTo(puck.x + nx * arrowLen, puck.y + ny * arrowLen);
      ctx.lineTo(
        puck.x + nx * arrowLen - Math.cos(arrowAngle - 0.5) * headLen,
        puck.y + ny * arrowLen - Math.sin(arrowAngle - 0.5) * headLen
      );
      ctx.lineTo(
        puck.x + nx * arrowLen - Math.cos(arrowAngle + 0.5) * headLen,
        puck.y + ny * arrowLen - Math.sin(arrowAngle + 0.5) * headLen
      );
      ctx.closePath();
      ctx.fillStyle = '#FFD700';
      ctx.fill();
    };

    // --- Ray Leg 1 (Direct Path) ---
    const cush1 = findCushionHit(start.x, start.y, dirX, dirY);
    const puck1 = findPuckHit(start.x, start.y, dirX, dirY, Math.min(totalRange, cush1.t));

    if (puck1) {
      const hitX = start.x + dirX * puck1.t;
      const hitY = start.y + dirY * puck1.t;

      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = aimColor;
      ctx.shadowColor = aimColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(hitX, hitY);
      ctx.stroke();

      drawImpactArrow(hitX, hitY, puck1.puck);
    } else if (cush1.t < totalRange) {
      // Cushion Rebound (Bank Shot)
      const bounceX = start.x + dirX * cush1.t;
      const bounceY = start.y + dirY * cush1.t;

      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = aimColor;
      ctx.shadowColor = aimColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(bounceX, bounceY);
      ctx.stroke();

      // Cushion bounce point ring
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(bounceX, bounceY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bounceX, bounceY, 10, 0, Math.PI * 2);
      ctx.strokeStyle = aimColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Calculate reflected vector
      const reflDirX = cush1.isVertical ? -dirX : dirX;
      const reflDirY = cush1.isVertical ? dirY : -dirY;
      const maxRefl = isLaser ? 380 : 50;
      const remainingRange = Math.min(Math.max(0, totalRange - cush1.t), maxRefl);

      // --- Ray Leg 2 (Reflected Path) ---
      const puck2 = findPuckHit(bounceX, bounceY, reflDirX, reflDirY, remainingRange);
      if (puck2) {
        const hitX2 = bounceX + reflDirX * puck2.t;
        const hitY2 = bounceY + reflDirY * puck2.t;

        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(bounceX, bounceY);
        ctx.lineTo(hitX2, hitY2);
        ctx.stroke();

        drawImpactArrow(hitX2, hitY2, puck2.puck);
      } else {
        const cush2 = findCushionHit(bounceX, bounceY, reflDirX, reflDirY);
        const leg2Dist = Math.min(remainingRange, cush2.t);
        const endX2 = bounceX + reflDirX * leg2Dist;
        const endY2 = bounceY + reflDirY * leg2Dist;

        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(bounceX, bounceY);
        ctx.lineTo(endX2, endY2);
        ctx.stroke();
      }
    } else {
      // Straight line within range
      const endX = start.x + dirX * totalRange;
      const endY = start.y + dirY * totalRange;

      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = aimColor;
      ctx.shadowColor = aimColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    ctx.restore();
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-md mx-auto select-none bg-[#0e0c15] text-white p-2 relative">
      {/* Sleek Compact In-Game HUD (Replaces stacked headers into 1 unified bar) */}
      <div className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#171324] rounded-2xl border border-purple-900/40 shadow-lg">
        {/* Left: Pause / Back & Level */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic.light();
              setIsPaused(true);
            }}
            className="p-1.5 rounded-xl bg-purple-950/80 border border-purple-800/50 text-gray-300 hover:text-white active:scale-95"
            aria-label="Pause"
          >
            <Pause size={15} />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-pink-300 leading-tight">
                {mode === 'pass_and_play'
                  ? 'Pass & Play'
                  : mode === 'ai_match'
                  ? 'AI Duel'
                  : mode === 'zen'
                  ? 'Zen Mode'
                  : `Level ${currentLevel.levelNumber}`}
              </span>
              {combo > 1 && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40 animate-pulse">
                  {combo}x
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              {mode === 'pass_and_play' || mode === 'ai_match'
                ? `P1: ${p1Score} | P2: ${p2Score}`
                : `Target: ${pucksLeft} left`}
            </p>
          </div>
        </div>

        {/* Center: Actionable Queen Cover Alert ONLY when Queen is pocketed */}
        {queenState === 'pending_cover' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-950/90 border border-rose-500 animate-pulse text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.6)]">
            <Crown size={12} className="text-yellow-400" />
            <span>COVER QUEEN (POCKET ANY PUCK)</span>
          </div>
        )}
        {queenState === 'covered' && (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 shadow-sm">
            <Crown size={11} className="text-yellow-400" />
            <span>Queen Secured</span>
          </div>
        )}

        {/* Right: Clean Strikes Counter or 2P Score */}
        <div className="flex items-center gap-2">
          {mode === 'pass_and_play' || mode === 'ai_match' ? (
            <div className="flex items-center gap-2 text-xs font-black">
              <span className={activePlayer === 'P1' ? 'text-amber-400 font-extrabold' : 'text-gray-400'}>
                P1: {p1Score}
              </span>
              <span className="text-gray-600">|</span>
              <span className={activePlayer === 'P2' ? 'text-cyan-400 font-extrabold' : 'text-gray-400'}>
                P2: {p2Score}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-purple-950/70 border border-purple-800/40">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Strikes</span>
              {mode === 'zen' ? (
                <span className="text-xs font-black text-cyan-300">∞</span>
              ) : (
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(strikesLeft, 5) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-sm border border-amber-600/50"
                    />
                  ))}
                  <span className="text-xs font-black text-amber-300 ml-0.5">{strikesLeft}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Board (Responsive to both width & height to prevent clipping) */}
      <div className="relative w-[min(96vw,calc(100vh-175px),400px)] aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-900/50 bg-[#261713] my-auto">
        <canvas
          ref={canvasRef}
          width={600 * currentLevel.boardScale}
          height={600 * currentLevel.boardScale}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full touch-none cursor-crosshair"
        />

        {/* Level Clear Overlay */}
        {gameState === 'won' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-pop-in z-20">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center shadow-glow-gold mb-2">
              <Trophy size={36} className="text-amber-900" />
            </div>
            <h2 className="text-2xl font-black text-amber-300 text-gold-stroke">SWEET VICTORY!</h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Level {currentLevel.levelNumber} Cleared! Score: {score}
            </p>

            <div className="flex gap-2 my-2.5">
              <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-amber-900">★</div>
              <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-amber-900">★</div>
              <div className={`w-7 h-7 rounded-full ${strikesLeft >= 2 ? 'bg-yellow-400 text-amber-900' : 'bg-gray-700 text-gray-500'} flex items-center justify-center font-bold`}>★</div>
            </div>

            {/* Base Coins Earned */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-black mb-3">
              <span>🪙 +{strikesLeft >= 2 ? 75 : strikesLeft === 1 ? 50 : 25} Coins Won!</span>
            </div>

            {/* PO 2x Double Coins Rewarded Video Button */}
            {onRequestDoubleRewardAd && (
              <button
                onClick={onRequestDoubleRewardAd}
                className="btn-candy w-full max-w-[250px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-amber-950 font-black text-xs shadow-candy flex items-center justify-center gap-1.5 mb-2 active:scale-95 transition-all"
              >
                <Gift size={16} fill="#451a03" />
                <span>DOUBLE REWARD (2X COINS • 5s AD)</span>
              </button>
            )}

            <div className="flex gap-2 w-full max-w-[250px]">
              <button
                onClick={onRestartLevel}
                className="btn-candy flex-1 py-2.5 rounded-2xl bg-purple-900 border border-purple-700 text-white font-bold text-xs"
              >
                REPLAY
              </button>
              <button
                onClick={onExitToHome}
                className="btn-candy flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-black text-xs shadow-candy"
              >
                NEXT
              </button>
            </div>
          </div>
        )}

        {/* Game Over / Out of Strikes Overlay (Includes Second Chance Rewarded Ad Option!) */}
        {gameState === 'lost' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-pop-in z-20">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/30 border border-rose-500 flex items-center justify-center mb-3 text-rose-400">
              <Target size={32} />
            </div>
            <h2 className="text-2xl font-black text-rose-400 text-candy-stroke">OUT OF STRIKES!</h2>
            <p className="text-xs text-gray-300 mt-1 mb-4">
              Target pucks still left on board.
            </p>

            {/* Second Chance Option */}
            {onRequestSecondChanceAd && (
              <button
                onClick={onRequestSecondChanceAd}
                className="btn-candy w-full max-w-[240px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 font-black text-xs shadow-candy flex items-center justify-center gap-2 mb-2"
              >
                <Gift size={16} />
                <span>+2 Extra Strikes (Watch 5s Ad)</span>
              </button>
            )}

            <button
              onClick={onRestartLevel}
              className="btn-candy w-full max-w-[240px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs shadow-candy"
            >
              <RotateCcw size={15} className="inline mr-1" />
              <span>Retry from Start</span>
            </button>
          </div>
        )}

        {/* In-Game Pause Menu Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-pop-in z-30">
            <h2 className="text-xl font-black text-amber-300 mb-1">MATCH PAUSED</h2>
            <p className="text-xs text-gray-400 mb-4">Level {currentLevel.levelNumber} • {currentLevel.title}</p>

            <div className="space-y-2.5 w-full max-w-[230px]">
              <button
                onClick={() => {
                  triggerHaptic.light();
                  setIsPaused(false);
                }}
                className="btn-candy w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 font-black text-xs shadow-candy flex items-center justify-center gap-1.5"
              >
                <Play size={16} fill="#064e3b" />
                <span>RESUME</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic.light();
                  setIsPaused(false);
                  onRestartLevel();
                }}
                className="btn-candy w-full py-2.5 rounded-2xl bg-purple-900 border border-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={15} />
                <span>RESTART LEVEL</span>
              </button>

              {/* Settings modal shortcut */}
              {onOpenSettings && (
                <button
                  onClick={() => {
                    triggerHaptic.light();
                    onOpenSettings();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-[#1e1735] border border-purple-800/60 text-gray-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                >
                  <Settings size={15} className="text-amber-400" />
                  <span>GAME SETTINGS</span>
                </button>
              )}

              <button
                onClick={() => {
                  triggerHaptic.light();
                  setIsPaused(false);
                  onExitToHome();
                }}
                className="btn-candy w-full py-2.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Home size={15} />
                <span>QUIT TO HOME</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sleek Bottom Status Bar (Direct touch on board used for striker placement) */}
      <div className="w-full bg-[#171324] rounded-2xl px-3 py-2 border border-purple-900/40 shadow-lg mt-1 select-none flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 font-bold text-gray-300">
            <span>Score:</span>
            <span className="text-amber-300 font-extrabold">{score}</span>
          </div>
          <span className="text-gray-600">•</span>
          <div className="text-[11px] text-purple-300 font-medium truncate max-w-[210px]">
            {statusMessage}
          </div>
        </div>

        <button
          onClick={onRestartLevel}
          className="px-2.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800/50 text-[11px] font-bold text-gray-300 hover:text-white flex items-center gap-1 active:scale-95 transition-all shadow-sm"
          title="Reset Level"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
