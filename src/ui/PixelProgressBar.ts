import Phaser from 'phaser';

const BAR_WIDTH = 2800;
const BAR_HEIGHT = 112;
const SEGMENT_WIDTH = 56;

/** Hard-edged loader presentation; all geometry snaps to integer segment widths. */
export class PixelProgressBar {
  private readonly frame: Phaser.GameObjects.Graphics;
  private readonly fill: Phaser.GameObjects.Graphics;
  private readonly status: Phaser.GameObjects.Text;
  private readonly percent: Phaser.GameObjects.Text;
  private readonly x: number;
  private readonly y: number;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    this.x = Math.round((width - BAR_WIDTH) / 2);
    this.y = Math.round(height / 2 + 130);

    scene.add
      .text(width / 2, height / 2 - 310, 'LOADING BALTIMORE', {
        fontFamily: '"Courier New", monospace',
        fontSize: '142px',
        fontStyle: 'bold',
        color: '#e8fbff',
        stroke: '#0b2f63',
        strokeThickness: 22,
        letterSpacing: 5,
      })
      .setOrigin(0.5)
      .setResolution(1);

    scene.add
      .text(width / 2, height / 2 - 90, 'MANIFEST-DRIVEN ASSET LINK', {
        fontFamily: '"Courier New", monospace',
        fontSize: '54px',
        color: '#22d3ee',
        letterSpacing: 8,
      })
      .setOrigin(0.5)
      .setResolution(1);

    this.frame = scene.add.graphics();
    this.fill = scene.add.graphics();
    this.status = scene.add
      .text(this.x, this.y + 180, 'READING MANIFESTS', {
        fontFamily: '"Courier New", monospace',
        fontSize: '48px',
        color: '#e8fbff',
        letterSpacing: 4,
      })
      .setResolution(1);
    this.percent = scene.add
      .text(this.x + BAR_WIDTH, this.y - 76, '000%', {
        fontFamily: '"Courier New", monospace',
        fontSize: '54px',
        fontStyle: 'bold',
        color: '#69f0ff',
      })
      .setOrigin(1, 0)
      .setResolution(1);

    this.drawFrame();
    this.update(0, 0);
  }

  update(loaded: number, total: number): void {
    const ratio = total > 0 ? Phaser.Math.Clamp(loaded / total, 0, 1) : 0;
    const snappedWidth = Math.floor((BAR_WIDTH * ratio) / SEGMENT_WIDTH) * SEGMENT_WIDTH;
    this.fill.clear();
    this.fill.fillStyle(0x22d3ee, 1);
    this.fill.fillRect(this.x + 16, this.y + 16, snappedWidth, BAR_HEIGHT - 32);

    // White registration ticks remain visible over the cyan signal fill.
    this.fill.fillStyle(0xe8fbff, 0.88);
    for (let tickX = this.x + 16; tickX < this.x + 16 + snappedWidth; tickX += SEGMENT_WIDTH * 5) {
      this.fill.fillRect(tickX, this.y + 16, 12, BAR_HEIGHT - 32);
    }

    const percentage = Math.round(ratio * 100);
    this.percent.setText(`${percentage.toString().padStart(3, '0')}%`);
    this.status.setText(total > 0 ? `ASSET ${loaded.toString().padStart(2, '0')} / ${total}` : 'READING MANIFESTS');
  }

  showComplete(): void {
    this.percent.setText('100%');
    this.status.setText('LOAD COMPLETE // LEVEL SIGNAL READY').setColor('#69f0ff');
  }

  showError(message: string): void {
    this.status.setText(`LOAD HALTED // ${message}`).setColor('#ff8ba7');
    this.percent.setText('ERR').setColor('#ff8ba7');
  }

  private drawFrame(): void {
    this.frame.fillStyle(0x06142f, 1).fillRect(this.x, this.y, BAR_WIDTH + 32, BAR_HEIGHT);
    this.frame.lineStyle(14, 0x22d3ee, 1).strokeRect(this.x, this.y, BAR_WIDTH + 32, BAR_HEIGHT);
    this.frame.lineStyle(4, 0xe8fbff, 0.7).strokeRect(this.x + 20, this.y + 20, BAR_WIDTH - 8, BAR_HEIGHT - 40);
  }
}
