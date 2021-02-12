class DataModder{
    constructor(){};

    getrelevantData = (data) =>{
        let dataObject = {
            currentTemp: data.main.temp,
            feelingTemp: data.main.feels_like,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            clouds: data.weather[0].description
        };
        return dataObject;
    }

    makeRandom = () => {
        return Math.floor(Math.random() * Math.floor(10));
    }

    // ÄÖ converter
    makePigGermanysaize = (value) => {
        value = value.toLowerCase();
        value = value.replace(/ä/g, 'ae');
        value = value.replace(/ö/g, 'oe');
        value = value.replace(/ü/g, 'ue');
        value = value.replace(/ß/g, 'ss');
        value = value.replace(/ /g, '-');
        value = value.replace(/\./g, '');
        value = value.replace(/,/g, '');
        value = value.replace(/\(/g, '');
        value = value.replace(/\)/g, '');
        return value;
    }
}

module.exports = DataModder;