if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('../sw.js')
        .then(function () {
            console.log('Service worker registered!');
        })
}

let searchForm = $("#search-form");

let currentWeatherData = $("#current-weather-data");
let foreseenWeather = $("#foreseen-weather");

searchForm.submit((e) => {
    e.preventDefault();
    let city = e.currentTarget[0].value;
    console.log(city)
    showWeatherByCity(city)
    showForeseenWeatherByCity(city)
})
   const API_KEY = '06dbf7aa4bf7d7d95ddd18f3ef4489c6'
   
const showWeather = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geoCallback);
    } else {
        console.log("Geo Location not supported by browser");
    }

}

const weatherComponent = (data) => {
    let date = convertStringToDate(data.dt);
    return `
    <div class='time'>
        <div class='day-of-week'>
            <i class="fas fa-clock"/>
            <h2>${date.dayOfWeek}</h2>
        </div>
    <p>${date.day} ${date.month} ${date.year}</p><br/>
    </div>
    <div class='location'>
        <i class='fas fa-map-marker'/> <span>${data.name}</span><br/>
        &#127759;: <span>${data.sys.country}</span><br/>
        <hr>
    </div>
    <div class='temperature'>
        <i class='fas fa-thermometer-three-quarters'/><span class='main-temperature'>${Math.round(data.main.temp)}&#176;</span><br/>
        <i class='fas fa-temperature-low'/><span>${Math.round(data.main.temp_min)}&#176 Min</span><br/>
        <i class='fas fa-temperature-high'/><span>${Math.round(data.main.temp_max)}&#176 Max</span><br/>
    </div>
    <div class='atmospheric'><i class='fas fa-cloud'/>: <span>${data.weather[0].main}</span><br/>
        <i class='fas fa-wind'/>: <span>${Math.round(data.wind.speed*3.6)} km/h</span><br/>
        &#128168;: <span>${data.main.humidity}%Humidty</span><br/>
    </div>`;
}

const geoCallback = (position) => {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        .then((response) => {
            return response.json();
        }).then((data) => {
            let wc = weatherComponent(data);
            let html = $.parseHTML(wc)
            currentWeatherData.html(html)
            console.log(data);
        })
        .catch(error => {
            alert('Internet connection failed, and not in cache')
        })

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            let city = data.city
            let foreseenList = data.list
                .filter((item) => item.dt_txt.endsWith('12:00:00'))
                .map((item) => foreseenWeatherComponent(item, city))
            foreseenWeather.html(foreseenList)
            console.log(data);
        })
        // .catch(error => {
        //     alert('Internet connection failed, and not in cache')
        // })
}

const showWeatherByCity = (city) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log(data);
            if (data.cod == 200) {
                let wc = weatherComponent(data);
                let html = $.parseHTML(wc)
                currentWeatherData.html(html)
            } else if (data.cod == "404") {
                alert(`City ${city} not found`)
            }
        })
        .catch(error => {
            console.log(error)
            alert('Internet connection failed, and not in cache')
        })
}

const showForeseenWeatherByCity = (city) => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log(data);
            if (data.cod == "200") {
                let city = data.city
                let foreseenList = data.list
                    .filter((item) => item.dt_txt.endsWith('12:00:00'))
                    .map((item) => foreseenWeatherComponent(item, city))
                foreseenWeather.html(foreseenList)
            } else if (data.cod == "404") {
                alert(`City ${city} not found`)
            }
        })
        .catch(error => {
            console.log(error)
            alert('Internet connection failed, and not in cache')
        })
}


const foreseenWeatherComponent = (data, city) => {
    let date = convertStringToDate(data.dt);
    return `<div class='foreseen'>
    <div class='time-location'>
        <div class='time'>
            <h2>${date.dayOfWeek}</h2>
            <p>${date.day} ${date.month} ${date.year}</p><br/>
        </div>
        <div class='location'>
        <i class='fas fa-map-marker'/>: <span>${city.name}</span><br/>
            &#127759;: <span>${city.country}</span><br/>
            <hr>
        </div>
    </div>
    
    <div class='temperature'>🌡<span class='main-temperature'>${Math.round(data.main.temp)}&#176;</span><br/>
        Min: <span>${Math.round(data.main.temp_min)}&#176;</span><br/>
        Max: <span>${Math.round(data.main.temp_max)}&#176;</span><br/></div>
        <div class='atmospheric'>
              &#9729;: <span>${data.weather[0].main}</span><br/>
            <i class='fas fa-wind'/>: <span>${Math.round(data.wind.speed*3.6)} km/h</span><br/>
            &#128168;: <span>${data.main.humidity}%Humidty</span><br/>
            
        </div>
    </div></div>`;
}

const convertStringToDate = (unixTime) => {
    const date = new Date(unixTime * 1000)
        .toGMTString()
        .replace(",", "")
        .split(" ");

    return {
        year: date[3],
        month: date[2],
        day: date[1],
        dayOfWeek: date[0],
    };
}

showWeather();
