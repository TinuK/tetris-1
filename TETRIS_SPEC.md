# Tetris Game Specification

This document provides a comprehensive specification for implementing a classic Tetris game following the official Tetris Guidelines.

## Table of Contents
1. [Game Board & Playfield](#game-board--playfield)
2. [Tetromino Pieces](#tetromino-pieces)
3. [Rotation System](#rotation-system)
4. [Game Mechanics](#game-mechanics)
5. [Scoring System](#scoring-system)
6. [Level Progression](#level-progression)
7. [Controls & Input](#controls--input)
8. [Game States](#game-states)
9. [Audio Requirements](#audio-requirements)
10. [Technical Implementation Notes](#technical-implementation-notes)

## Game Board & Playfield

### Dimensions
- **Visible Playfield**: 10 cells wide × 20 cells tall
- **Buffer Zone**: 20 additional rows above the visible area (total height: 40 rows)
- **Piece Spawn Area**: Rows 21-22 (above visible area)

### Coordinate System
- Origin (0,0) at bottom-left of visible playfield
- X-axis increases rightward (0-9)
- Y-axis increases upward (0-39, with 0-19 visible)

### Visual Representation
```
Row 39 ┌──────────┐ ← Top of buffer zone
       │          │
Row 21 │    ▼     │ ← Piece spawn area
Row 20 ├══════════┤ ← Top of visible area
       │          │
       │          │
       │    ▓▓    │
       │  ▓▓▓▓▓   │
Row 0  └──────────┘ ← Bottom of playfield
       0123456789
```

## Tetromino Pieces

All tetrominoes are composed of 4 connected blocks. There are 7 distinct pieces:

### I-Piece (Cyan)
```
Spawn State:    Rotation States:
    ▓▓▓▓        ▓
                ▓
                ▓
                ▓
```
- Color: Cyan (#00FFFF)
- Spawn Position: Columns 3,4,5,6 Row 21
- Center of Rotation: Between blocks 2 and 3

### J-Piece (Blue)
```
Spawn State:    Rotation States:
▓               ▓▓
▓▓▓             ▓
                ▓▓
```
- Color: Blue (#0000FF)
- Spawn Position: Columns 3,4,5 Rows 21-22
- Center of Rotation: Center block

### L-Piece (Orange)
```
Spawn State:    Rotation States:
  ▓               ▓▓
▓▓▓                ▓
                  ▓▓
```
- Color: Orange (#FFA500)
- Spawn Position: Columns 3,4,5 Rows 21-22
- Center of Rotation: Center block

### O-Piece (Yellow)
```
Spawn State (no rotation):
▓▓
▓▓
```
- Color: Yellow (#FFFF00)
- Spawn Position: Columns 4,5 Rows 21-22
- Center of Rotation: Between all 4 blocks (no actual rotation)

### S-Piece (Green)
```
Spawn State:    Rotation States:
 ▓▓             ▓
▓▓              ▓▓
                 ▓
```
- Color: Green (#00FF00)
- Spawn Position: Columns 3,4,5 Rows 21-22
- Center of Rotation: Center block

### Z-Piece (Red)
```
Spawn State:    Rotation States:
▓▓               ▓
 ▓▓             ▓▓
                ▓
```
- Color: Red (#FF0000)
- Spawn Position: Columns 3,4,5 Rows 21-22
- Center of Rotation: Center block

### T-Piece (Purple)
```
Spawn State:    Rotation States:
 ▓              ▓
▓▓▓             ▓▓
                ▓
```
- Color: Purple (#800080)
- Spawn Position: Columns 3,4,5 Rows 21-22
- Center of Rotation: Center block
- **Special**: Can perform T-spins for bonus points

## Rotation System

### Super Rotation System (SRS)

The game uses the Super Rotation System with wall kicks. When a basic rotation is blocked, the system attempts up to 4 additional positions:

#### Rotation Points for Non-I Pieces
For each rotation attempt, test these 5 positions in order:
1. **Basic Rotation**: Standard 90° rotation
2. **Wall Kick Right/Left**: Move 1 cell horizontally
3. **Wall Kick + Up**: Move 1 cell horizontally and up
4. **Down**: Move down (floor kick)
5. **Down + Wall Kick**: Move down and horizontally

#### I-Piece Special Wall Kicks
The I-piece has unique wall kick data due to its length:
- Additional horizontal movement offsets
- Special vertical adjustment rules

#### Rotation States
- **State 0**: Spawn state
- **State R**: Rotated 90° clockwise
- **State 2**: Rotated 180°
- **State L**: Rotated 270° clockwise (90° counterclockwise)

## Game Mechanics

### Piece Generation
- **7-Bag Randomizer**: Each piece appears exactly once per 7-piece sequence
- **Next Queue**: Shows upcoming 3-6 pieces
- **Ghost Piece**: Transparent preview showing drop position

### Piece Movement
- **Left/Right**: Move one cell horizontally per input
- **Soft Drop**: Accelerated downward movement (20× gravity)
- **Hard Drop**: Instant placement at ghost piece position
- **Rotation**: 90° clockwise/counterclockwise with wall kicks

### Hold System
- Store current piece for later use
- Swap current piece with held piece
- Can only hold once per piece (resets after lock down)
- No hold allowed on first frame after hold usage

### Lock Down
- **Lock Delay**: 0.5 seconds from when piece can't move down
- **Move Reset**: Lock timer resets on successful movement/rotation (max 15 resets)
- **Lock Out**: Game over if piece locks above visible area

### Line Clearing
- **Detection**: Check for complete horizontal lines after each lock down
- **Clear Animation**: Brief flash/highlight before removal
- **Gravity**: Blocks above cleared lines fall down
- **Multiple Lines**: Process all cleared lines simultaneously

#### Line Clear Types
- **Single**: 1 line cleared
- **Double**: 2 lines cleared
- **Triple**: 3 lines cleared
- **Tetris**: 4 lines cleared
- **T-Spin**: Line clear involving a T-piece that performed a T-spin

## Scoring System

### Base Scoring (per level)
- **Single**: 100 × (level + 1)
- **Double**: 300 × (level + 1)
- **Triple**: 500 × (level + 1)
- **Tetris**: 800 × (level + 1)

### T-Spin Bonuses
- **T-Spin Single**: 800 × (level + 1)
- **T-Spin Double**: 1200 × (level + 1)
- **T-Spin Triple**: 1600 × (level + 1)

### Additional Scoring
- **Soft Drop**: 1 point per cell dropped
- **Hard Drop**: 2 points per cell dropped
- **Back-to-Back Bonus**: 50% bonus for consecutive Tetrises or T-spins

## Level Progression

### Level Advancement
- Start at Level 1
- Advance by clearing lines:
  - Level 1-9: Every 10 lines
  - Level 10-15: Every 20 lines
  - Level 16+: Every 30 lines

### Gravity Speed (Frames per Drop)
```
Level  1: 48 frames (0.8 seconds at 60 FPS)
Level  2: 43 frames
Level  3: 38 frames
Level  4: 33 frames
Level  5: 28 frames
Level  6: 23 frames
Level  7: 18 frames
Level  8: 13 frames
Level  9:  8 frames
Level 10:  6 frames
Level 13:  5 frames
Level 16:  4 frames
Level 19:  3 frames
Level 29:  2 frames
Level 30+: 1 frame (1/60 second)
```

## Controls & Input

### Standard Keyboard Controls
- **Left Arrow**: Move left
- **Right Arrow**: Move right
- **Down Arrow**: Soft drop
- **Up Arrow**: Hard drop
- **Z/z**: Rotate counterclockwise (accepts both uppercase and lowercase)
- **X/x**: Rotate clockwise (accepts both uppercase and lowercase)
- **C/c**: Hold piece (accepts both uppercase and lowercase)
- **Space**: Hard drop (alternative)
- **P/p**: Pause game (accepts both uppercase and lowercase)
- **R/r**: Restart game (when game over, accepts both uppercase and lowercase)

**Note**: All letter keys accept both uppercase (with Shift) and lowercase (without Shift) input for improved accessibility and user experience.

### Gamepad Controls
- **D-Pad Left/Right**: Move left/right
- **D-Pad Down**: Soft drop
- **D-Pad Up**: Hard drop
- **Button A**: Rotate counterclockwise
- **Button B**: Rotate clockwise
- **Shoulder Buttons**: Hold piece
- **Start**: Pause game

### Input Timing
- **DAS (Delayed Auto Shift)**: 167ms initial delay, then 33ms repeat rate
- **DCD (DAS Cut Delay)**: No delay when changing directions
- **Lock Delay**: 500ms maximum

## Game States

### Main Game States
1. **Menu**: Start screen with options
2. **Playing**: Active gameplay
3. **Paused**: Game suspended, resume possible
4. **Game Over**: Final score display, restart option
5. **Level Transition**: Brief celebration between levels

### Game Over Conditions
1. **Block Out**: New piece spawns overlapping existing blocks
2. **Lock Out**: Piece locks completely above visible playfield (row 20+)
3. **Partial Lock Out**: Part of piece locks above visible area

### UI Elements
- **Score Display**: Current score, high score
- **Level Display**: Current level
- **Lines Display**: Lines cleared this level / total
- **Next Queue**: Upcoming pieces (3-6 pieces)
- **Hold Box**: Currently held piece
- **Ghost Piece**: Semi-transparent landing preview

## Visual Design Specification

Based on the classic Tetris UI design, the game should implement the following visual style:

### Block Rendering
Each tetromino block should be rendered as a **3D beveled square** with:
- **Main Color**: Solid fill matching tetromino color
- **Highlight Edge**: Lighter shade on top and left edges (simulating light source)
- **Shadow Edge**: Darker shade on bottom and right edges (simulating depth)
- **Border**: Thin dark outline around entire block
- **Size**: Square blocks filling grid cells completely

### Grid and Playfield
- **Background**: Dark gray/black (#1a1a1a or similar)
- **Grid Lines**: Bright blue (#0066ff) thin lines separating all cells
- **Playfield Border**: Golden/yellow outer border (#ffd700) around entire game area
- **Grid Visibility**: Grid lines visible at all times, even in empty cells

### Color Palette (3D Beveled Blocks)
Each piece uses a triadic color scheme for the 3D effect:

#### I-Piece (Cyan)
- Main: #00ffff (cyan)
- Highlight: #66ffff (light cyan)
- Shadow: #0099cc (dark cyan)

#### J-Piece (Blue)
- Main: #0000ff (blue)
- Highlight: #6666ff (light blue)
- Shadow: #0000cc (dark blue)

#### L-Piece (Orange)
- Main: #ff6600 (orange)
- Highlight: #ff9966 (light orange)
- Shadow: #cc3300 (dark orange)

#### O-Piece (Yellow)
- Main: #ffff00 (yellow)
- Highlight: #ffff66 (light yellow)
- Shadow: #cccc00 (dark yellow)

#### S-Piece (Green)
- Main: #00ff00 (green)
- Highlight: #66ff66 (light green)
- Shadow: #00cc00 (dark green)

#### Z-Piece (Red)
- Main: #ff0000 (red)
- Highlight: #ff6666 (light red)
- Shadow: #cc0000 (dark red)

#### T-Piece (Purple)
- Main: #ff00ff (magenta/purple)
- Highlight: #ff66ff (light purple)
- Shadow: #cc00cc (dark purple)

### Layout and Positioning
- **Central Game Board**: 10×20 visible grid with blue grid lines
- **Golden Border**: Thick decorative border around entire play area
- **Block Placement**: Blocks fill grid cells completely, aligned to grid
- **Visual Hierarchy**: Game board is the primary focus, centered in the display

### Rendering Details
- **Block Bevel Effect**: 2-3 pixel wide highlight/shadow edges
- **Grid Line Width**: 1 pixel thin lines
- **Border Thickness**: 4-6 pixel golden border
- **Anti-aliasing**: Sharp, pixel-perfect rendering (retro style)
- **Consistency**: All blocks use the same 3D bevel effect regardless of position

## Audio Requirements

### Music
- **Default Theme**: Korobeiniki (Russian folk song)
- **Alternative Themes**: Additional music tracks optional
- **Dynamic Audio**: Music tempo may increase with level

### Sound Effects
- **Piece Movement**: Subtle click/tap sounds
- **Piece Rotation**: Rotation confirmation sound
- **Piece Lock**: Lock down confirmation
- **Line Clear**: Different sounds for Single/Double/Triple/Tetris
- **T-Spin**: Special sound effect
- **Level Up**: Achievement/progression sound
- **Game Over**: Final sound effect

## Technical Implementation Notes

### Performance Requirements
- **Frame Rate**: 60 FPS target
- **Input Lag**: < 3 frames (50ms) maximum
- **Update Rate**: Game logic at 60Hz

### Memory Considerations
- **Playfield State**: 2D array of 40×10 cells
- **Piece Definitions**: Pre-calculated rotation states
- **Random Bag**: Current 7-piece sequence state
- **Game History**: Score, lines, level progression

### Validation Rules
- Piece placement must not overlap existing blocks
- All movements must stay within playfield boundaries
- Line clears must be processed atomically
- Score calculations must be consistent across game sessions

### Accessibility Features (Optional)
- **High Contrast Mode**: Enhanced visual distinction
- **Screen Reader Support**: Text descriptions of game state
- **Customizable Controls**: User-defined key bindings
- **Visual Indicators**: Sound effect visual representations

---

*This specification follows the official Tetris Guidelines and is designed to create an authentic Tetris experience. All measurements, timings, and mechanics are based on the standard implementations used in licensed Tetris games.*