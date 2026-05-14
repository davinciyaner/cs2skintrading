'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import en from '../../messages/en.json'
import de from '../../messages/de.json'

const messages = { en, de }
const I18nContext = createContext()

export function I18nProvider({ children }) {
    const [locale, setLocale] = useState('en')

    useEffect(() => {
        const saved = document.cookie.match(/NEXT_LOCALE=([^;]+)/)?.[1]
        if (saved === 'de' || saved === 'en') setLocale(saved)
    }, [])

    const switchLocale = (lang) => {
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`
        setLocale(lang)
    }

    const t = (key) => key.split('.').reduce((obj, k) => obj?.[k], messages[locale]) ?? key

    return (
        <I18nContext.Provider value={{ locale, switchLocale, t }}>
            {children}
        </I18nContext.Provider>
    )
}

export const useI18n = () => useContext(I18nContext)