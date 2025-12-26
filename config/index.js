import configProd from './prod.js'
import configDev from './dev.js'

export var config

if (process.env.NODE_ENV === 'production') {
    config = configProd
} else {
    config = configDev
}
console.log('Config loaded:', process.env.NODE_ENV)
// config=configProd
config.isGuestMode = true
