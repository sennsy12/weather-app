document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '47a7f06dc56f615fc549ab04243a78fc'; // Replace with your OpenWeatherMap API key
    const maxSearchHistory = 3; // Maximum number of cities to display in the last search history
    const maxForecastDays = 6; // Maximum number of days to display in the forecast

    const cityInput = document.getElementById('city');
    const searchButton = document.getElementById('search');
    const lastSearchElement = document.getElementById('last-search');
    const mainCard = document.querySelector('.main-card'); // Target the main card container
    const forecastCard = document.querySelector('.forecast-card'); // Target the forecast card container

    let searchHistory = getSearchHistory();
    // Initial API call and data population
    fetchWeatherData('Oslo'); // default city 

    searchButton.addEventListener('click', () => {
        const cityName = cityInput.value;
        if (cityName) {
            fetchWeatherData(cityName);
        }
    });

    async function fetchWeatherData(cityName) {
        try {
            const [weatherData, forecastData] = await Promise.all([
                fetchWeather(cityName, 'weather'),
                fetchWeather(cityName, 'forecast')
            ]);

            if (weatherData.cod === 200 && forecastData.cod === '200') {
                updateSearchHistory(cityName, weatherData);
                displaySearchHistory(searchHistory);
                displayMainCard(weatherData);
                displayForecastCard(forecastData);
            } else {
                alert('Location not found. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    async function fetchWeather(cityName, type) {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/${type}?q=${cityName}&appid=${apiKey}&units=metric`);
        return response.json();
    }

    function updateSearchHistory(cityName, weatherData) {
        searchHistory.unshift({ city: cityName, weatherData });
        if (searchHistory.length > maxSearchHistory) {
            searchHistory.pop();
        }
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }


function displaySearchHistory(searchHistory) {
    const searchHistoryList = document.getElementById('search-history-list');
    searchHistoryList.innerHTML = '';
    searchHistory.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('search-history-item');
        listItem.setAttribute('data-index', index);
        listItem.innerHTML = `
            <h3>${entry.city}</h3>
            ${entry.weatherData.main ? `
                <div class="weather-data">
                    <div class="data-icon"><i class="fas fa-thermometer-half"></i></div>
                    <p>Temperature: ${entry.weatherData.main.temp.toFixed(2)}°C</p>
                </div>
                <div class="weather-data">
                    <div class="data-icon"><i class="fas fa-sun"></i></div>
                    <p>${entry.weatherData.weather[0].description}</p>
                </div>
                <div class="weather-data">
                    <div class="data-icon"><i class="fas fa-tint"></i></div>
                    <p>Humidity: ${entry.weatherData.main.humidity}%</p>
                </div>
                <div class="weather-data">
                    <div class="data-icon"><i class="fas fa-cloud"></i></div>
                    <p>Cloudiness: ${entry.weatherData.clouds.all}%</p>
                </div>
            ` : '<p>Weather information not available.</p>'}
        `;
        searchHistoryList.appendChild(listItem);
    });

    // Add click event listeners to search history items
    const searchHistoryItems = document.querySelectorAll('.search-history-item');
    searchHistoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = item.getAttribute('data-index');
            if (searchHistory[index]) {
                const cityName = searchHistory[index].city;
                fetchWeatherData(cityName);
            }
        });
    });
}


    function displayMainCard(weatherData) {
        mainCard.innerHTML = `
            <h2>${weatherData.name}, ${weatherData.sys.country}</h2>
            <h3>${getCurrentDateTime()}</h3>
            ${weatherData.main ? `
            <div class="data-icon"><img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png" alt="weather-icon"></div>
            <div class="weather-data">
                <div class="data-icon"><i class="fas fa-thermometer-half"></i></div>
                <p>Temperature: ${weatherData.main.temp.toFixed(2)}°C</p>
            </div>
            <div class="weather-data">
                <div class="data-icon"><i class="fas fa-tint"></i></div>
                <p>Humidity: ${weatherData.main.humidity}%</p>
            </div>
            <div class="weather-data">
                <div class="data-icon"><i class="fas fa-cloud"></i></div>
                <p>Cloudiness: ${weatherData.clouds.all}%</p>
            </div>
        ` : '<p>Weather information not available.</p>'}
        `;
    }
    
    function displayForecastCard(forecastData) {
        // Group forecast data by day
        const forecastByDay = {};
        forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toDateString();
            if (!forecastByDay[day]) {
                forecastByDay[day] = [];
            }
            forecastByDay[day].push(item);
        });
    
        forecastCard.innerHTML = `
            <h2>6-Day Forecast:</h2>
            <ul>
                ${Object.keys(forecastByDay).slice(0, maxForecastDays).map(day => {
                    const dayData = forecastByDay[day];
                    const averageTemp = dayData.reduce((total, item) => total + item.main.temp, 0) / dayData.length;
                    const weatherData = dayData[0];
                    return `
                        <li>
                            <h3>${new Date(weatherData.dt * 1000).toDateString()}</h3>
                            <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" alt="weather-icon">
                            <div class="weather-data">
                            <div class="data-icon"><i class="fas fa-thermometer-half"></i></div>
                            <p>Temperature: ${weatherData.main.temp.toFixed(2)}°C</p>
                        </div>
                            <div class="weather-data">
                            <div class="data-icon"><i class="fas fa-tint"></i></div>
                            <p>Humidity: ${weatherData.main.humidity}%</p>
                        </div>
                        <div class="weather-data">
                            <div class="data-icon"><i class="fas fa-cloud"></i></div>
                            <p>Cloudiness: ${weatherData.clouds.all}%</p>
                        </div>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
    }
    

function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString(); // Change the format as needed
}

    function getSearchHistory() {
        const storedHistory = localStorage.getItem('searchHistory');
        return storedHistory ? JSON.parse(storedHistory) : [];
    }
});

