import 'dayjs/locale/fr'

import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isoWeek from 'dayjs/plugin/isoWeek'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import weekday from 'dayjs/plugin/weekday'

// Configuration des plugins dayjs
dayjs.extend(isBetween)
dayjs.extend(isoWeek)
dayjs.extend(weekday)
dayjs.extend(utc)
dayjs.extend(timezone)

// Configuration de la locale française
dayjs.locale('fr')

// Définir le fuseau horaire par défaut (ex: Paris)
dayjs.tz.setDefault('Europe/Paris')

export default dayjs

// Export des types utiles
export type { Dayjs } from 'dayjs'
