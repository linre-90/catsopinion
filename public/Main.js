const getWeather = "/find?town=";

/***** selectors *****/
const submitBtn = document.getElementById("submitBTN");
const townInputField = document.getElementById("place");
const resultField = document.getElementById("result");
const resuldFieldExplanation = document.getElementById("resultText");
const humidyField = document.getElementById("humidityResult"); 
const humidyFieldExplanation = document.getElementById("humidityResultText");
const windresult = document.getElementById("windResult");// "#windResult";
const windResultExplanation = document.getElementById("windResultResultText"); //"#windResultResultText";
const catVerdict =  document.getElementById("catverdict"); //"#catverdict";
const responseDiv = document.getElementById("resultSection"); //"#resultSection";
const askWeatherDiv = document.getElementById("resultSectionQuestion"); //"#resultSectionQuestion";
const weatherLoaderIcon = document.getElementById("waitWeatherResponse");
const minimizeWeatherApBtn = document.getElementById("minimizeWeather");


// make request if input has receicved user input
const onCheckWeatherClicked = async () => {
    minimizeWeatherApBtn.addEventListener("click", minimizeWeatherApp);
    if(townInputField.value.length > 0){
        weatherLoaderIcon.style.display = "block";
        askWeatherDiv.classList.add("moveAnimation");
        setTimeout(() => {
            responseDiv.classList.remove("hide");
            responseDiv.classList.add("showAnimation");
        },250)
        // make api request to server
        let cityName = townInputField.value;
        let parsedString = cityName/*.replaceAll(/[^a-zA-Z\u0080-\uFFFF]/ig,"")*/;
        const response = await fetch(getWeather+parsedString).catch(console.dir);
        const waitetResponse = await response.json().catch(console.warn);
        if(response.status !== 200){
            resetTexts();
            updateText(resultField, "", "Something went wrong!");
            weatherLoaderIcon.style.display = "none";
            return;
        }
        else if(waitetResponse.cod == 404){
            resetTexts();
            updateText(resultField,"" ,waitetResponse.message);
            weatherLoaderIcon.style.display = "none";
            return;
        }
        else{
            //set texts and get info if cat wants to be outside!
            weatherLoaderIcon.style.display = "none";
            fillresultformTexts(waitetResponse);
        }
    }
}

//check that user has written something and adjust button
const chekInputLength = () => {
    submitBtn.addEventListener("click",onCheckWeatherClicked);
    if(townInputField.value.length > 0){
        submitBtn.disabled = false;
        submitBtn.addEventListener("mouseover", () => {
            submitBtn.style.backgroundColor = "#afd5aa";
            submitBtn.style.color = "black";
        });
        document.getElementById("submitBTN").addEventListener("mouseout", () => {
            submitBtn.style.backgroundColor = "";
            submitBtn.style.color = "";
        });
    }
    else{
        submitBtn.disabled = true;
    }
}

// fills result form fields with no text
const resetTexts = () => {
    updateText(resuldFieldExplanation, "",  "");
    updateText(resultField, "",  "");
    updateText(humidyField, "",  "");
    updateText(humidyFieldExplanation, "",  "");
    updateText(windresult, "",  "");
    updateText(windResultExplanation, "",  "");
    updateText(catVerdict, "", "");
}

//updates html tag text
const updateText = (field, hintText, text) => {
    field.innerHTML = hintText + text;
};

const getDataFromServer= async (address) =>{
    const response = await fetch(address);
    if(response.status === 200){
        return response;
    }else{
        console.log("Something is very badly wrong!");
    }
}

const fillresultformTexts = async (dataObject) =>{
    updateResults(resultField, resuldFieldExplanation, dataObject.temperature, dataObject.tempMessage);
    updateResults(humidyField, humidyFieldExplanation, dataObject.humidity, dataObject.humidityMessage);
    updateResults(windresult, windResultExplanation, dataObject.windSpeed, dataObject.windMessage);
    updateText(catVerdict,"Vilma's opinion: ", dataObject.catsVerdict);
   
}

const updateResults= (resultField, Messagefield, resultsWeather, message) =>{
    updateText(resultField, resultsWeather, "");
    updateText(Messagefield, "", message);
}

const minimizeWeatherApp = () => {
    responseDiv.classList.add("hide");
    askWeatherDiv.classList.add("outAnimation");
    setTimeout(() => {
        askWeatherDiv.classList.remove("outAnimation");
        askWeatherDiv.classList.remove("moveAnimation");
    },250);
}

townInputField.addEventListener("keyup", chekInputLength);
