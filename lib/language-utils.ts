// Language utility functions
export interface Language {
  code: string
  name: string
  nativeName: string
  rtl?: boolean
}

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
]

// Basic translations (in production, use a proper i18n library)
export const translations: { [key: string]: { [key: string]: string } } = {
  en: {
    welcome: "Welcome",
    dashboard: "Dashboard",
    balance: "Balance",
    transfer: "Transfer",
    deposit: "Deposit",
    withdraw: "Withdraw",
    transactions: "Transactions",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Information",
  },
  es: {
    welcome: "Bienvenido",
    dashboard: "Panel",
    balance: "Saldo",
    transfer: "Transferir",
    deposit: "Depositar",
    withdraw: "Retirar",
    transactions: "Transacciones",
    settings: "Configuración",
    profile: "Perfil",
    logout: "Cerrar sesión",
    loading: "Cargando...",
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    confirm: "Confirmar",
    success: "Éxito",
    error: "Error",
    warning: "Advertencia",
    info: "Información",
  },
  fr: {
    welcome: "Bienvenue",
    dashboard: "Tableau de bord",
    balance: "Solde",
    transfer: "Transférer",
    deposit: "Dépôt",
    withdraw: "Retirer",
    transactions: "Transactions",
    settings: "Paramètres",
    profile: "Profil",
    logout: "Déconnexion",
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    confirm: "Confirmer",
    success: "Succès",
    error: "Erreur",
    warning: "Avertissement",
    info: "Information",
  },
  de: {
    welcome: "Willkommen",
    dashboard: "Dashboard",
    balance: "Guthaben",
    transfer: "Übertragen",
    deposit: "Einzahlen",
    withdraw: "Abheben",
    transactions: "Transaktionen",
    settings: "Einstellungen",
    profile: "Profil",
    logout: "Abmelden",
    loading: "Laden...",
    save: "Speichern",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    confirm: "Bestätigen",
    success: "Erfolg",
    error: "Fehler",
  },
}

export function getLanguageName(languageCode: string): string {
  const language = languages.find((l) => l.code === languageCode)
  return language?.name || languageCode
}

export function getLanguageNativeName(languageCode: string): string {
  const language = languages.find((l) => l.code === languageCode)
  return language?.nativeName || languageCode
}

export function isRTLLanguage(languageCode: string): boolean {
  const rtlLanguages = ["ar", "he", "fa", "ur"]
  return rtlLanguages.includes(languageCode)
}

export function translate(key: string, languageCode = "en"): string {
  return translations[languageCode]?.[key] || translations.en[key] || key
}

export const languagesUpdated = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "no", name: "Norwegian" },
  { code: "fi", name: "Finnish" },
  { code: "pl", name: "Polish" },
  { code: "cs", name: "Czech" },
]

export function getLocaleFromLanguage(languageCode: string): string {
  const localeMap: { [key: string]: string } = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    zh: "zh-CN",
    ja: "ja-JP",
    ko: "ko-KR",
    ar: "ar-SA",
    ru: "ru-RU",
    hi: "hi-IN",
    tr: "tr-TR",
    nl: "nl-NL",
    sv: "sv-SE",
    da: "da-DK",
    no: "no-NO",
    fi: "fi-FI",
    pl: "pl-PL",
    cs: "cs-CZ",
  }

  return localeMap[languageCode] || "en-US"
}
