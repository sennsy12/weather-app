document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '47a7f06dc56f615fc549ab04243a78fc'; // Replace with your OpenWeatherMap API key
    const maxSearchHistory = 3; // Maximum number of cities to display in the last search history
    const maxForecastDays = 6; // Maximum number of days to display in the forecast

    const cityInput = document.getElementById('city');
    const searchButton = document.getElementById('search');
    const lastSearchElement = document.getElementById('last-search');
    const forecastElement = document.getElementById('forecast');
    let searchHistory = getSearchHistory(); // Retrieve search history from Local Storage

    // Define the getSearchHistory function to retrieve search history from Local Storage
    function getSearchHistory() {
        const storedHistory = localStorage.getItem('searchHistory');
        return storedHistory ? JSON.parse(storedHistory) : [];
    }

    // Define the updateSearchHistory function to update the search history
    function updateSearchHistory(cityName, weatherData) {
        searchHistory.unshift({ city: cityName, weatherData: weatherData });

        if (searchHistory.length > maxSearchHistory) {
            searchHistory.pop();
        }

        // Save the updated search history to Local Storage
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

        return searchHistory;
    }

    // Define the displaySearchHistory function to display the search history
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
                                <p>Temperature: ${entry.weatherData.main.temp}°C</p>
                            </div>
                            <div class="weather-data">
                                <div class="data-icon"><i class="fas fa-sun"></i></div>
                                <p> ${entry.weatherData.weather[0].description}</p>
                            </div>
                            <div class="weather-data">
                                <div class="data-icon"><i class="fas fa-tint"></i></div>
                                <p> ${entry.weatherData.main.humidity}%</p>
                            </div>
                            <div class="weather-data">
                                <div class="data-icon"><i class="fas fa-cloud"></i></div>
                                <p> ${entry.weatherData.clouds.all}%</p>
                            </div>
                        ` : '<p>Weather information not available.</p>'}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    searchButton.addEventListener('click', () => {
        const cityName = cityInput.value;
        if (cityName) {
            fetchWeatherData(cityName);
        }
    });

    async function fetchWeatherData(cityName) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

        try {
            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(weatherUrl),
                fetch(forecastUrl)
            ]);

            if (weatherResponse.status === 200 && forecastResponse.status === 200) {
                const weatherData = await weatherResponse.json();
                const forecastData = await forecastResponse.json();
                searchHistory = updateSearchHistory(cityName, weatherData);
                displaySearchHistory(searchHistory);
                displayForecast(forecastData);
            } else {
                alert('Location not found. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    function displayForecast(forecastData) {
        const forecastList = forecastData.list.slice(0, maxForecastDays);

        forecastElement.innerHTML = `
            <h2>6-Day Forecast:</h2>
            <ul>
                ${forecastList.map(item => `
                    <li>
                        <h3>${new Date(item.dt * 1000).toDateString()}</h3>
                        <div class="weather-data">
                            <div class="data-icon"><i class="fas fa-thermometer-half"></i></div>
                            <p>${item.main.temp}°C</p>
                        </div>
                        <div class="weather-data">
                            <div class="data-icon"><i class="fas fa-sun"></i></div>
                            <p>${item.weather[0].description}</p>
                        </div>
                        <div class="weather-data">
                            <div class="data-icon"><i class="fas fa-tint"></i></div>
                            <p> ${item.main.humidity}%</p>
                        </div>
                        <div class="weather-data">
                            <div class="data-icon"><i class="fas fa-cloud"></i></div>
                            <p> ${item.clouds.all}%</p>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    // Rest of your code remains the same.
});
