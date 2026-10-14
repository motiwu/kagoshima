'use client'

import { useSyncExternalStore } from 'react'
import { jstToday } from './format'

const subscribe = () => () => {}

/** 日本時間的今天；伺服器端（快取的 HTML）回傳 null，避免顯示過期的日期 */
export const useJstToday = () => useSyncExternalStore(subscribe, () => jstToday(), () => null)
