import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { storageKeys } from '@/api/mockStorage'
import { getSettings, resetSettings, updateSettings } from '@/api/settings.api'
import { defaultSettings } from '@/types/settings'

describe('settings api', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns default settings when storage is empty', async () => {
    await expect(getSettings()).resolves.toEqual(defaultSettings)
  })

  it('falls back to default settings when settings JSON is malformed', async () => {
    localStorage.setItem(storageKeys.settings, '{bad json')

    await expect(getSettings()).resolves.toEqual(defaultSettings)
  })

  it('updates and resets settings', async () => {
    const updatedSettings = await updateSettings({ theme: 'dark', enableSampleData: true })

    expect(updatedSettings).toEqual({
      currency: 'KRW',
      theme: 'dark',
      enableSampleData: true,
    })
    await expect(getSettings()).resolves.toEqual(updatedSettings)

    await expect(resetSettings()).resolves.toEqual(defaultSettings)
    await expect(getSettings()).resolves.toEqual(defaultSettings)
  })

  it('rejects with a typed storage error when reset cannot remove stored settings', async () => {
    await updateSettings({ theme: 'dark' })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('remove failed')
    })

    await expect(resetSettings()).rejects.toMatchObject({
      code: 'storage_write_failed',
      message: '브라우저 저장소 삭제에 실패했습니다.',
    })
  })
})
