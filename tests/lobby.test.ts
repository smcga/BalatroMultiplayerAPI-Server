import { afterEach, describe, expect, it, vi } from 'vitest'

import Client from '../src/Client.js'
import Lobby, { getEnemy } from '../src/Lobby.js'

const createMockClient = (overrides?: Partial<Client>) => {
        const sendAction = vi.fn()
        const closeConnection = vi.fn()
        const client = new Client({}, sendAction, closeConnection)

        if (overrides) {
                Object.assign(client, overrides)
        }

        return { client, sendAction, closeConnection }
}

afterEach(() => {
        vi.clearAllMocks()
})

describe('Lobby', () => {
        it('registers the host client on creation and notifies them', () => {
                const { client: host, sendAction } = createMockClient({ username: 'Host' })

                const lobby = new Lobby(host)

                expect(host.lobby).toBe(lobby)
                expect(sendAction).toHaveBeenCalledWith(
                        expect.objectContaining({
                                action: 'joinedLobby',
                                code: lobby.code,
                                type: lobby.gameMode,
                        }),
                )

                lobby.leave(host)
        })

        it('allows a guest to join and shares lobby information', () => {
                const { client: host, sendAction: hostSend } = createMockClient({ username: 'Host' })
                const lobby = new Lobby(host)

                const { client: guest, sendAction: guestSend } = createMockClient({ username: 'Guest' })
                lobby.join(guest)

                expect(lobby.guest).toBe(guest)
                expect(guest.lobby).toBe(lobby)

                expect(
                        guestSend.mock.calls.some(([payload]) =>
                                payload.action === 'joinedLobby' && payload.code === lobby.code,
                        ),
                ).toBe(true)
                expect(
                        guestSend.mock.calls.some(([payload]) => payload.action === 'lobbyOptions'),
                ).toBe(true)
                expect(
                        hostSend.mock.calls.some(
                                ([payload]) => payload.action === 'lobbyInfo' && payload.isHost === true,
                        ),
                ).toBe(true)

                lobby.leave(guest)
                lobby.leave(host)
        })

        it('returns the opposing client with getEnemy', () => {
                const { client: host } = createMockClient({ username: 'Host' })
                const lobby = new Lobby(host)

                const { client: guest } = createMockClient({ username: 'Guest' })
                lobby.join(guest)

                expect(getEnemy(host)).toEqual([lobby, guest])
                expect(getEnemy(guest)).toEqual([lobby, host])

                const { client: outsider } = createMockClient({ username: 'Outsider' })
                expect(getEnemy(outsider)).toEqual([null, null])

                lobby.leave(guest)
                lobby.leave(host)
        })
})
