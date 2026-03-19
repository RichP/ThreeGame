import type { GameState, PlayerId } from '../../game/gamestate'

export interface ShareCardOptions {
  width?: number
  height?: number
}

function winnerText(winner: PlayerId | null): string {
  if (winner === 'p1') return 'Player 1 wins'
  if (winner === 'p2') return 'Player 2 wins'
  return 'Draw'
}

function formatDate(d: Date): string {
  // Keep it short and locale-friendly.
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function buildMatchSummaryText(args: {
  gameState: GameState
  winner: PlayerId | null
  seriesBestOf?: 3 | 5
  seriesWins?: { p1: number; p2: number }
}): string {
  const { gameState, winner, seriesBestOf, seriesWins } = args
  const lines: string[] = []
  lines.push(`ThreeGame — Match Result: ${winnerText(winner)}`)
  if (seriesBestOf && seriesWins) {
    lines.push(`Series (BO${seriesBestOf}): P1 ${seriesWins.p1} - P2 ${seriesWins.p2}`)
  }
  lines.push(`Turns: ${gameState.matchStats.turnsPlayed}`)
  lines.push(`Hits/Misses/Crits: ${gameState.matchStats.hits}/${gameState.matchStats.misses}/${gameState.matchStats.crits}`)
  lines.push(`Damage: P1 ${gameState.matchStats.damageByPlayer.p1} | P2 ${gameState.matchStats.damageByPlayer.p2}`)
  lines.push('')
  lines.push('Per unit:')
  Object.entries(gameState.matchStats.perUnit).forEach(([unitId, stats]) => {
    lines.push(`${unitId}: K ${stats.kills} · DT ${stats.damageTaken} · AL ${stats.attacksLanded} · TS ${stats.turnsSurvived}`)
  })
  return lines.join('\n')
}

export function renderMatchShareCard(canvas: HTMLCanvasElement, args: {
  gameState: GameState
  winner: PlayerId | null
  seriesBestOf?: 3 | 5
  seriesWins?: { p1: number; p2: number }
  seed?: number
  options?: ShareCardOptions
}) {
  const { gameState, winner, seriesBestOf, seriesWins, seed, options } = args

  const width = options?.width ?? 1200
  const height = options?.height ?? 630
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, '#020617')
  bg.addColorStop(1, '#0f172a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  // Accent grid
  ctx.globalAlpha = 0.12
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1
  const step = 48
  for (let x = 0; x < width; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Header
  ctx.fillStyle = '#f8fafc'
  ctx.font = '900 44px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText('ThreeGame', 56, 92)

  ctx.fillStyle = '#fef08a'
  ctx.font = '900 40px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText(winnerText(winner), 56, 150)

  ctx.fillStyle = '#cbd5e1'
  ctx.font = '700 20px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText(formatDate(new Date()), 56, 186)

  if (typeof seed === 'number') {
    ctx.fillStyle = '#94a3b8'
    ctx.font = '700 18px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
    ctx.fillText(`Seed: ${seed}`, 56, 214)
  }

  // Stat blocks
  const boxX = 56
  const boxY = 250
  const boxW = 540
  const boxH = 300

  ctx.fillStyle = 'rgba(2, 6, 23, 0.55)'
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)'
  ctx.lineWidth = 2
  roundRect(ctx, boxX, boxY, boxW, boxH, 18)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#e2e8f0'
  ctx.font = '900 18px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText('Match Stats', boxX + 18, boxY + 36)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '700 18px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'

  const lines: Array<[string, string]> = [
    ['Turns', String(gameState.matchStats.turnsPlayed)],
    ['Hits / Misses / Crits', `${gameState.matchStats.hits} / ${gameState.matchStats.misses} / ${gameState.matchStats.crits}`],
    ['Damage (P1)', String(gameState.matchStats.damageByPlayer.p1)],
    ['Damage (P2)', String(gameState.matchStats.damageByPlayer.p2)],
  ]
  if (seriesBestOf && seriesWins) {
    lines.unshift(['Series', `BO${seriesBestOf}: P1 ${seriesWins.p1} - P2 ${seriesWins.p2}`])
  }

  let y = boxY + 74
  for (const [label, value] of lines) {
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(label, boxX + 18, y)
    ctx.fillStyle = '#f1f5f9'
    ctx.textAlign = 'right'
    ctx.fillText(value, boxX + boxW - 18, y)
    ctx.textAlign = 'left'
    y += 34
  }

  // Per-unit summary (compact)
  ctx.fillStyle = '#38bdf8'
  ctx.font = '900 18px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText('Per-unit', boxX + 18, boxY + boxH - 96)

  ctx.fillStyle = '#cbd5e1'
  ctx.font = '700 16px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  const perUnit = Object.entries(gameState.matchStats.perUnit).slice(0, 6)
  let puY = boxY + boxH - 64
  for (const [unitId, stats] of perUnit) {
    ctx.fillText(
      `${unitId}: K${stats.kills} DT${stats.damageTaken} AL${stats.attacksLanded}`,
      boxX + 18,
      puY,
    )
    puY += 22
  }

  // Right side callout
  const rightX = 640
  ctx.fillStyle = '#e2e8f0'
  ctx.font = '900 28px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText('Play the match:', rightX, 300)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '700 18px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText('/match', rightX, 332)

  ctx.fillStyle = 'rgba(56, 189, 248, 0.12)'
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
  ctx.lineWidth = 2
  roundRect(ctx, rightX, 360, 500, 150, 18)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#7dd3fc'
  ctx.font = '900 20px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText('Tip', rightX + 18, 396)
  ctx.fillStyle = '#e0f2fe'
  ctx.font = '700 18px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText('Share this card with your friends', rightX + 18, 430)
  ctx.fillStyle = '#cbd5e1'
  ctx.font = '700 16px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
  ctx.fillText('Download PNG or copy the text summary.', rightX + 18, 460)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
