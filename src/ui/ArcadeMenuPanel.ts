import Phaser from 'phaser';

const COLORS = {
  cabinet: 0x06142f,
  deepBlue: 0x0b2f63,
  cyan: 0x22d3ee,
  ice: 0xe8fbff,
  shadow: 0x071a36,
  signal: 0x69f0ff,
} as const;

export const MENU_OPTIONS = ['Start Game', 'Quit'] as const;
export type MenuOption = (typeof MENU_OPTIONS)[number];

export interface ArcadeMenuPanel {
  readonly root: Phaser.GameObjects.Container;
  readonly optionTexts: readonly Phaser.GameObjects.Text[];
  setSelection(index: number): void;
  showQuitFallback(): void;
}

/** Hard-edged two-option arcade menu. No filters, gradients, or fractional geometry. */
export function createArcadeMenuPanel(scene: Phaser.Scene): ArcadeMenuPanel {
  const { width, height } = scene.scale;
  const centerX = Math.round(width / 2);
  const root = scene.add.container(0, 0).setDepth(10);

  const backdrop = scene.add.graphics();
  backdrop.fillStyle(COLORS.cabinet, 1).fillRect(0, 0, width, height);
  backdrop.fillStyle(COLORS.deepBlue, 1).fillRect(0, 270, width, 36);
  backdrop.fillStyle(COLORS.deepBlue, 1).fillRect(0, height - 300, width, 36);
  backdrop.fillStyle(COLORS.ice, 0.04);
  for (let y = 0; y < height; y += 24) backdrop.fillRect(0, y, width, 5);

  backdrop.lineStyle(12, COLORS.cyan, 0.82);
  backdrop.strokeRect(150, 150, width - 300, height - 300);
  backdrop.lineStyle(4, COLORS.ice, 0.45);
  backdrop.strokeRect(186, 186, width - 372, height - 372);

  const eyebrow = scene.add
    .text(centerX, 420, 'BALTIMORE // SHARE CIRCUIT', {
      fontFamily: '"Courier New", monospace',
      fontSize: '58px',
      fontStyle: 'bold',
      color: '#69f0ff',
      letterSpacing: 9,
    })
    .setOrigin(0.5)
    .setResolution(1);

  const titleShadow = scene.add
    .text(centerX + 28, 680 + 28, 'SHARE-RUNNER', {
      fontFamily: '"Courier New", monospace',
      fontSize: '236px',
      fontStyle: 'bold',
      color: '#071a36',
      stroke: '#071a36',
      strokeThickness: 28,
      letterSpacing: -12,
    })
    .setOrigin(0.5)
    .setResolution(1);
  const title = scene.add
    .text(centerX, 680, 'SHARE-RUNNER', {
      fontFamily: '"Courier New", monospace',
      fontSize: '236px',
      fontStyle: 'bold',
      color: '#e8fbff',
      stroke: '#0b2f63',
      strokeThickness: 28,
      letterSpacing: -12,
    })
    .setOrigin(0.5)
    .setResolution(1);

  const panel = scene.add.graphics();
  panel.fillStyle(COLORS.shadow, 0.96).fillRect(centerX - 900, 950, 1800, 820);
  panel.lineStyle(12, COLORS.deepBlue, 1).strokeRect(centerX - 900, 950, 1800, 820);
  panel.lineStyle(4, COLORS.cyan, 0.75).strokeRect(centerX - 866, 984, 1732, 752);

  const prompt = scene.add
    .text(centerX, 1080, 'SELECT RUN MODE', {
      fontFamily: '"Courier New", monospace',
      fontSize: '54px',
      fontStyle: 'bold',
      color: '#22d3ee',
      letterSpacing: 8,
    })
    .setOrigin(0.5)
    .setResolution(1);

  const optionFrames: Phaser.GameObjects.Graphics[] = [];
  const optionTexts = MENU_OPTIONS.map((option, index) => {
    const y = 1290 + index * 250;
    const frame = scene.add.graphics();
    optionFrames.push(frame);
    const text = scene.add
      .text(centerX, y, option.toUpperCase(), {
        fontFamily: '"Courier New", monospace',
        fontSize: '92px',
        fontStyle: 'bold',
        color: '#e8fbff',
        letterSpacing: 8,
      })
      .setOrigin(0.5)
      .setResolution(1)
      .setInteractive(
        new Phaser.Geom.Rectangle(-720, -82, 1440, 164),
        Phaser.Geom.Rectangle.Contains,
      );
    return text;
  });

  const controls = scene.add
    .text(centerX, height - 220, 'ARROWS / W-S TO SELECT  //  ENTER / SPACE TO CONFIRM', {
      fontFamily: '"Courier New", monospace',
      fontSize: '42px',
      color: '#e8fbff',
      letterSpacing: 4,
    })
    .setOrigin(0.5)
    .setResolution(1);

  const fallback = scene.add
    .text(centerX, 1905, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#69f0ff',
      align: 'center',
      letterSpacing: 3,
    })
    .setOrigin(0.5)
    .setResolution(1)
    .setVisible(false);

  root.add([
    backdrop,
    eyebrow,
    titleShadow,
    title,
    panel,
    prompt,
    ...optionFrames.flatMap((frame, index) => [frame, optionTexts[index]]),
    fallback,
    controls,
  ]);

  const drawSelection = (selectedIndex: number): void => {
    optionFrames.forEach((frame, index) => {
      const y = 1290 + index * 250;
      const selected = index === selectedIndex;
      frame.clear();
      frame.fillStyle(selected ? COLORS.deepBlue : COLORS.cabinet, 1);
      frame.fillRect(centerX - 720, y - 82, 1440, 164);
      frame.lineStyle(selected ? 10 : 4, selected ? COLORS.signal : COLORS.deepBlue, 1);
      frame.strokeRect(centerX - 720, y - 82, 1440, 164);
      optionTexts[index].setColor(selected ? '#69f0ff' : '#e8fbff');
      optionTexts[index].setText(`${selected ? '> ' : '  '}${MENU_OPTIONS[index].toUpperCase()}${selected ? ' <' : '  '}`);
    });
  };

  drawSelection(0);

  return {
    root,
    optionTexts,
    setSelection(index: number): void {
      drawSelection(index);
      fallback.setVisible(false);
    },
    showQuitFallback(): void {
      fallback.setText('BROWSER EXIT BLOCKED // YOU ARE SAFE AT THE TITLE');
      fallback.setVisible(true);
    },
  };
}
