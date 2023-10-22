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
    fetchWeatherData('Oslo'); // You can replace 'New York' with the default city you want

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
        lastSearchElement.innerHTML = `
            <h2>Last Searched:</h2>
            <ul>
                ${searchHistory.map(entry => `
                    <li>
                        <h3>${entry.city}</h3>
                        ${entry.weatherData.main ? `
                            <div class="weather-data">
                                <div class="data-icon"><i class="fas fa-thermometer-half"></i></div>
                                <p>${entry.weatherData.main.temp.toFixed(2)}°C</p>
                            </div>
                            <div class="weather-data">
                                <div class="data-icon"><i class="fas fa-sun"></i></div>
                                <p>${entry.weatherData.weather[0].description}</p>
                            </div>
                            <div class="weather-data">
                                <div class="data-icon"><i class="fas fa-tint"></i></div>
                                <p>${entry.weatherData.main.humidity}%</p>
                            </div>
                            <div class="weather-data">
                                <div class="data-icon"><i class="fas fa-cloud"></i></div>
                                <p>${entry.weatherData.clouds.all}%</p>
                            </div>
                        ` : '<p>Weather information not available.</p>'}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    function displayMainCard(weatherData) {
        mainCard.innerHTML = `
            <h2> ${weatherData.name}, ${weatherData.sys.country}</h2>
            <p>${new Date(weatherData.dt * 1000).toLocaleTimeString()}</p>
            ${weatherData.main ? `
                <div class="weather-data">
                    <div class="data-icon"><i class="fas fa-thermometer-half"></i></div>
                    <p>Temperature: ${weatherData.main.temp.toFixed(2)}°C</p>
                </div>
                <div class="weather-data">
                    <div class="data-icon"><i class="fas fa-sun"></i></div>
                    <p>${weatherData.weather[0].description}</p>
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
        const dailyForecasts = forecastData.list.reduce((result, item) => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!result[date]) {
                result[date] = [];
            }
            result[date].push(item);
            return result;
        }, {});
    
        forecastCard.innerHTML = `
            <h2>6-Day Forecast:</h2>
            <ul>
                ${Object.entries(dailyForecasts).map(([date, items]) => {
                    // Get the first item of the day
                    const firstItem = items[0];
                    return `
                        <li>
                            <h3>${new Date(firstItem.dt * 1000).toDateString()}</h3>
                            <p>Time: ${new Date(firstItem.dt * 1000).toLocaleTimeString()}</p>
                            <div class="weather-data">
                                <div class="data-icon"><i class="fas fa-thermometer-half"></i></div>
                                <p>Temperature: ${firstItem.main.temp.toFixed(2)}°C</p>
                            </div>
                            <div class="weather-data">
                                <div class="data-icon"><i class="fas fa-sun"></i></div>
                                <p>${firstItem.weather[0].description}</p>
                            </div>
                            <div class="weather-data">
                                <div class="data-icon"><i class="fas fa-tint"></i></div>
                                <p>Humidity: ${firstItem.main.humidity}%</p>
                            </div>
                            <div class="weather-data">
                                <div class="data-icon"><i class="fas fa-cloud"></i></div>
                                <p>Cloudiness: ${firstItem.clouds.all}%</p>
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
    }
    
        

    function getSearchHistory() {
        const storedHistory = localStorage.getItem('searchHistory');
        return storedHistory ? JSON.parse(storedHistory) : [];
    }
});
