module.exports = {
    ADTYPE: {
        ref: 'adType.value',
        rule: 'strict'
    },
    VEHICLETYPE: {
        ref: 'vehicleType.value',
        rule: 'strict'
    },
    FN_USE: {
        ref: 'vehicleFunctionUse.value'
    },
    TYPE: {
        ref: 'vehicleTypeSelect.value',
    },
    MAKE: {
        ref: 'manufacturer.make.value'
    },
    MODEL: {
        ref: 'manufacturer.model.value'
    },
    ENGINE_TYPE: {
        ref : 'vehicleEngine.type.value'
    },
    ENGINE_GAS: {
        ref : 'vehicleEngine.gas.value'
    },
    CYLINDER: {
        type: 'range',
        ref: 'vehicleEngine.cylinder',
    },
    GENERAL_STATE: {
        ref: 'vehicleGeneralState.value'
    },
    ADDRESS_CITY_POSTCODE: {
        ref : 'address.city.postcode'
    },
    AD_PRICE: {
        type: 'range',
        ref: 'price',
    },
    MILEAGE: {
        type: 'range',
        ref: 'mileage',
    },
    POWER_KW: {
        type: 'range',
        ref: 'power.kw',
        maxDisable : 400
    },
    CONSUMPTION_GKM: {
        type: 'range',
        ref: 'consumption.gkm',
    },
    DOORS: {
        type: 'range',
        ref: 'doors',
    },
    SEATS: {
        type: 'range',
        ref: 'seats',
    },
    BUNKS: {
        type: 'range',
        ref: 'seats',
    },
    DRIVER_CAB: {
        type: 'range',
        ref: 'driverCabin',
    },
    HOURS_USE: {
        type: 'range',
        ref: 'hoursOfUse',
    },
    EQUIPMENTS: {
        type: 'array',
        single: {},
    },
    BED_TYPE: {
        ref: 'bedType.value'
    },
    MATERIALS: {
        ref: 'materials.value'
    },
    EMISSION: {
        ref: 'emission.value'
    },
    PAINT: {
        ref: 'paint.value'
    },
    EXTERNAL_COLOR: {
        ref: 'externalColor.value'
    },
    INTERNAL_COLOR: {
        ref: 'internalColor.value'
    }
}



