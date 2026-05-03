'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../lib/api'

export default function AuthGuard({ children }) {
    const [status, setStatus] = useState('loading')
    const router = useRouter()

    useEffect(() => {
        api.getMe()
            .then(() => setStatus('ok'))
            .catch(() => {
                setStatus('denied')
                router.push('/')
            })
    }, [])

    if (status === 'loading') return <p style={{ textAlign: 'center', marginTop: '4rem', color: '#6b7280' }}>Laden…</p>
    if (status === 'denied') return null
    return children
}