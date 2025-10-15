import { describe, expect, it } from 'vitest'

import { generateSeed } from '../src/utils.js'

const allowedCharacters = new Set('ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'.split(''))

describe('generateSeed', () => {
        it('returns a string with the requested length', () => {
                const length = 10
                const seed = generateSeed(length)

                expect(seed).toHaveLength(length)
        })

        it('only uses allowed characters', () => {
                const seed = generateSeed(32)

                for (const char of seed) {
                        expect(allowedCharacters.has(char)).toBe(true)
                }
        })

        it('defaults to five characters when no length is given', () => {
                expect(generateSeed()).toHaveLength(5)
        })
})
