import Phaser from 'phaser';

const COLORS = {
  cabinet: 0x06142f,
  deepBlue: 0x0b2f63,
  cyan: 0x22d3ee,
  ice: 0xe8fbff,
  shadow: 0x071a36,
  signal: 0x69f0ff,
} as const;

export interface ArcadeTitleCard {
  readonly root: Phaser.GameObjects.Container;
  readonly title: Phaser.GameObjects.Text;
  readonly titleShadow: Phaser.GameObjects.Text;
  revealTitle(): void;
  setTitleOffset(x: number, y: number): void;
  pulse(active: boolean): void;
  showReadyState(): void;
}

/**
 * Builds the WO-07 title treatment from hard-edged Phaser primitives and text.
 * There are deliberately no gradients, filters, blur, or fractional coordinates.
 */
export function createArcadeTitleCard(scene: Phaser.Scene): ArcadeTitleCard {
  const { width, height } = scene.scale;
  const root = scene.add.container(0, 0).setDepth(10);

  const backdrop = scene.add.graphics();
  backdrop.fillStyle(COLORS.cabinet, 1).fillRect(0, 0, width, height);
  backdrop.fillStyle(COLORS.deepBlue, 1).fillRect(0, 310, width, 42);
  backdrop.fillStyle(COLORS.deepBlue, 1).fillRect(0, height - 360, width, 42);

  // A sparse CRT scanline field: integer geometry, no texture filtering.
  backdrop.fillStyle(COLORS.ice, 0.045);
  for (let y = 0; y < height; y += 24) backdrop.fillRect(0, y, width, 5);

  // Cabinet-edge registration marks make the 4400px composition feel authored.
  backdrop.lineStyle(12, COLORS.cyan, 0.8);
  backdrop.strokeRect(150, 150, width - 300, height - 300);
  backdrop.lineStyle(4, COLORS.ice, 0.45);
  backdrop.strokeRect(186, 186, width - 372, height - 372);

  const checker = scene.add.graphics();
  const block = 72;
  const stripY = height - 286;
  for (let x = 222, index = 0; x < width - 222; x += block, index += 1) {
    checker.fillStyle(index % 2 === 0 ? COLORS.cyan : COLORS.ice, 0.9);
    checker.fillRect(x, stripY, block, 24);
  }

  const eyebrow = scene.add
    .text(width / 2, 476, 'BALTIMORE // ROOFTOP CIRCUIT // RUN 01', {
      fontFamily: '"Courier New", monospace',
      fontSize: '66px',
      fontStyle: 'bold',
      color: '#69f0ff',
      letterSpacing: 10,
    })
    .setOrigin(0.5)
    .setResolution(1);

  const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: '"Courier New", monospace',
    fontSize: '310px',
    fontStyle: 'bold',
    color: '#e8fbff',
    stroke: '#0b2f63',
    strokeThickness: 34,
    align: 'center',
    letterSpacing: -16,
  };
  const titleX = Math.round(width / 2);
  const titleY = Math.round(height / 2 - 80);
  const titleShadow = scene.add
    .text(titleX + 36, titleY + 36, 'SHARE-RUNNER', {
      ...titleStyle,
      color: '#071a36',
      stroke: '#071a36',
    })
    .setOrigin(0.5)
    .setResolution(1)
    .setVisible(false);
  const title = scene.add
    .text(titleX, titleY, 'SHARE-RUNNER', titleStyle)
    .setOrigin(0.5)
    .setResolution(1)
    .setVisible(false);

  const subtitle = scene.add
    .text(width / 2, titleY + 310, 'FIVE SHARES. ONE FLAG. KEEP MOVING.', {
      fontFamily: '"Courier New", monospace',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#22d3ee',
      letterSpacing: 8,
    })
    .setOrigin(0.5)
    .setResolution(1);

  const skip = scene.add
    .text(width / 2, height - 212, 'PRESS ENTER / SPACE / CLICK TO SKIP', {
      fontFamily: '"Courier New", monospace',
      fontSize: '46px',
      color: '#e8fbff',
      letterSpacing: 5,
    })
    .setOrigin(0.5)
    .setResolution(1);

  const pulseFrame = scene.add.graphics().setVisible(false);

  root.add([
    backdrop,
    checker,
    pulseFrame,
    eyebrow,
    titleShadow,
    title,
    subtitle,
    skip,
  ]);

  const drawPulse = (): void => {
    pulseFrame.clear();
    pulseFrame.lineStyle(24, COLORS.signal, 0.92);
    pulseFrame.strokeRect(110, 110, width - 220, height - 220);
    pulseFrame.fillStyle(COLORS.cyan, 0.12);
    pulseFrame.fillRect(0, Math.round(height / 2) - 18, width, 36);
  };
  drawPulse();

  return {
    root,
    title,
    titleShadow,
    revealTitle(): void {
      title.setVisible(true);
      titleShadow.setVisible(true);
    },
    setTitleOffset(x: number, y: number): void {
      title.setPosition(titleX + Math.round(x), titleY + Math.round(y));
      titleShadow.setPosition(titleX + 36 + Math.round(x), titleY + 36 + Math.round(y));
    },
    pulse(active: boolean): void {
      pulseFrame.setVisible(active);
    },
    showReadyState(): void {
      skip.setText('INTRO COMPLETE // MENU SIGNAL READY');
      skip.setColor('#69f0ff');
    },
  };
}
