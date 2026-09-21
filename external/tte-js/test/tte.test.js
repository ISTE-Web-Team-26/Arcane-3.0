import test from 'node:test'
import assert from 'node:assert/strict'

import {
  colorAt,
  createEffect,
  effectCatalog,
  effectNames,
  mixColors,
  parseText,
  seededRandom,
} from '../src/index.js'

test('parseText creates a rectangular character grid', () => {
  const grid = parseText('HI\r\n世界\n')

  assert.equal(grid.columns, 2)
  assert.equal(grid.rows, 2)
  assert.equal(grid.cells.length, 4)
  assert.equal(grid.visibleCells.length, 4)
  assert.equal(grid.visibleCells[2].character, '世')
})

test('seededRandom repeats the same sequence', () => {
  const first = seededRandom('terminal')
  const second = seededRandom('terminal')

  assert.deepEqual(
    [first(), first(), first()],
    [second(), second(), second()],
  )
})

test('color helpers normalize and mix gradients', () => {
  assert.equal(mixColors('#000', '#fff', 0.5), '#808080')
  assert.equal(colorAt(['#f00', '#00ff00'], 0), '#ff0000')
  assert.equal(colorAt(['#f00', '#00ff00'], 1), '#00ff00')
})

test('built-in effects expose stable final frames', () => {
  const grid = parseText('TTE\n.JS')

  assert.equal(effectNames().length, 37)
  assert.equal(effectCatalog().length, 37)

  for (const name of effectNames()) {
    const effect = createEffect(name, {
      grid,
      options: {},
      random: seededRandom(name),
    })
    const frame = effect.render(1, 3000)

    for (const progress of [0.1, 0.5, 0.9]) {
      const activeFrame = effect.render(progress, progress * 2400)
      assert.ok(Array.isArray(activeFrame.cells))
      assert.ok(Array.isArray(activeFrame.particles))

      for (const cell of [...activeFrame.cells, ...activeFrame.particles]) {
        assert.equal(typeof cell.character, 'string', `${name} character`)
        assert.ok(Number.isFinite(cell.column), `${name} column`)
        assert.ok(Number.isFinite(cell.row), `${name} row`)
      }
    }

    assert.equal(frame.cells.length, grid.visibleCells.length)
    assert.deepEqual(
      frame.cells.map((cell) => cell.character),
      grid.visibleCells.map((cell) => cell.character),
    )
  }
})

test('laser etch begins hidden and ends without the beam', () => {
  const grid = parseText('LASER')
  const effect = createEffect('laser-etch', {
    grid,
    options: {},
    random: seededRandom(42),
  })

  assert.equal(effect.render(0).cells.length, 0)
  assert.equal(effect.render(1).beam, null)
})

test('unknown effects report the available names', () => {
  const grid = parseText('TTE')

  assert.throws(
    () => createEffect('teleport', { grid, options: {}, random: seededRandom(1) }),
    /Unknown effect "teleport".*beams.*laseretch.*wipe/,
  )
})
