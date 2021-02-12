class Cat{
    constructor(){};
    getWeatherOpinion(dataObject){
        let resultData = {"catWantsOut": true};
        let queryObject = {};
        for (const key in dataObject) {
            if (Object.hasOwnProperty.call(dataObject, key)) {
                //temperature analyze->
                if(key === "currentTemp"){
                    resultData["temperature"] = `Temperature was ${dataObject[key]} C.`
                    
                    if(Number(dataObject[key]) > 23.9){
                        resultData.catWantsOut = false;
                        queryObject["tempQuery"] = "tooHot";
                        //tempQuery = "tooHot";
                    }
                    else if(Number(dataObject[key]) < 7.2){
                        if(Number(dataObject[key]) < 0.0){
                            resultData.catWantsOut = false;
                            queryObject["tempQuery"] = "tooCold";
                            //tempQuery = "tooCold";
                        }else{
                            queryObject["tempQuery"] = "tempAlmostOk";
                            //tempQuery = "tempAlmostOk";
                        }
                    }else{
                        queryObject["tempQuery"] = "tempOk";
                        //tempQuery = "tempOk";
                    }
                }
                //<-temperature analyze
                // humidity analyze ->
                else if(key === "humidity"){
                    resultData["humidity"] =  `Humidity was ${dataObject[key]}%.`;
                    if(Number(dataObject[key]) > 60){
                        queryObject["humidityQuery"] = "humidityToHigh";
                        //humidityQuery = "humidityToHigh";
                    }
                    else{
                        queryObject["humidityQuery"] = "humidityOk";
                        //humidityQuery = "humidityOk";
                    }
                }
                // <-humidity analyze
                // wind speed warning
                else if(key === "windSpeed"){
                    queryObject["windQuery"] = "windSpeed";
                    //windQuery = "windSpeed";
                    resultData["windSpeed"] = `Wind speed was ${dataObject[key]} m/s. `;
                } 
            }
        }
        return {...resultData, ...queryObject};
    }
}

module.exports = Cat;


