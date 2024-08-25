export const DEFAULT_DELETE_TIMEOUT = 10 * 1000;

export const COMMAND = {
  START: /\/start/,
  START_PROGRAM: /\/start-program/,
  RULES: /\/rules/,
  SCHEDULE: /\/schedule/,
  CHECK_ME: /\/check_me/,
}

export const TIME_ZONES = [
  'Europe/Kaliningrad',   // MSK-1
  'Europe/Moscow',        // MSK+0
  'Asia/Yekaterinburg',   // YEKT (MSK+2)
  'Asia/Omsk',            // OMST (MSK+3)
  'Asia/Krasnoyarsk',     // KRAT (MSK+4)
  'Asia/Irkutsk',         // IRKT (MSK+5)
  'Asia/Yakutsk',         // YAKT (MSK+6)
  'Asia/Vladivostok',     // VLAT (MSK+7)
  'Asia/Magadan',         // MAGT (MSK+8)
  'Asia/Kamchatka',       // PETT (MSK+9)
  'Africa/Lagos',         // WAT (UTC+1)
  'Africa/Johannesburg',  // SAST (UTC+2)
  'Europe/London',        // GMT (UTC+0)
  'Europe/Paris',         // CET (UTC+1)
  'Europe/Berlin',        // CET (UTC+1)
  'Asia/Colombo',         // SLST (UTC+5:30)
  'Asia/Ho_Chi_Minh',     // ICT (UTC+7)
  'Asia/Bangkok',         // ICT (UTC+7)
  'Asia/Shanghai',        // CST (UTC+8)
  'Asia/Singapore',       // SGT (UTC+8)
  'Asia/Seoul',           // KST (UTC+9)
  'Asia/Tokyo',           // JST (UTC+9)
  'Asia/Dubai',           // GST (UTC+4)
  'Asia/Riyadh',          // AST (UTC+3)
  'Asia/Karachi',         // PKT (UTC+5)
  'Asia/Manila',          // PHT (UTC+8)
  'Australia/Sydney',     // AEDT (UTC+11)
  'Australia/Melbourne',  // AEDT (UTC+11)
  'America/Sao_Paulo',    // BRT (UTC-3)
  'America/Buenos_Aires', // ART (UTC-3)
  'America/Mexico_City',  // CST (UTC-6)
  'America/Chicago',      // CST (UTC-6)
  'America/Denver',       // MST (UTC-7)
  'America/Los_Angeles',  // PST (UTC-8)
  'America/New_York'      // EST (UTC-5)
]
