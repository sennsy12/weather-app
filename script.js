document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '47a7f06dc56f615fc549ab04243a78fc'; 
    const maxSearchHistory = 3; // Maximum number of cities to display in the last search history
    const maxForecastDays = 6; // Maximum number of days to display in the forecast

    const cityInput = document.getElementById('city');
    const searchButton = document.getElementById('search');
    const mainCard = document.querySelector('.main-card');
    const forecastContainer = document.querySelector('.forecast-container');
    const searchHistoryList = document.getElementById('search-history-list');

    let searchHistory = getSearchHistory();

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
                displaySearchHistory();
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
        searchHistory = searchHistory.filter(item => item.city !== cityName);
        searchHistory.unshift({ city: cityName, weatherData });
        if (searchHistory.length > maxSearchHistory) {
            searchHistory.pop();
        }
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

    function displaySearchHistory() {
        searchHistoryList.innerHTML = '';
        searchHistory.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('search-history-item');
            listItem.textContent = entry.city;
            listItem.addEventListener('click', () => fetchWeatherData(entry.city));
            searchHistoryList.appendChild(listItem);
        });
    }

    function displayMainCard(weatherData) {
        mainCard.innerHTML = `
            <h2>${weatherData.name}, ${weatherData.sys.country}</h2>
            <p>${getCurrentDateTime()}</p>
            <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" alt="${weatherData.weather[0].description}">
            <p class="temperature">${Math.round(weatherData.main.temp)}°C</p>
            <p>${weatherData.weather[0].description}</p>
            <p>Humidity: ${weatherData.main.humidity}%</p>
            <p>Wind: ${weatherData.wind.speed} m/s</p>
        `;
    }

    function displayForecastCard(forecastData) {
        forecastContainer.innerHTML = '';
        const dailyForecasts = getDailyForecasts(forecastData.list);
        
        console.log('Number of forecasts to display:', dailyForecasts.length); // Debug log
        
        dailyForecasts.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <h3>${formatDate(day.dt)}</h3>
                <div class="weather-icon"><i class="fas fa-${getWeatherIcon(day.weather[0].main)}"></i></div>
                <div class="temperature">${Math.round(day.main.temp)}°C</div>
                <div class="description">${day.weather[0].description}</div>
            `;
            forecastContainer.appendChild(card);
        });
    }

    function getDailyForecasts(forecastList) {

        const dailyForecasts = [];
        const seenDates = new Set();
        
        forecastList.forEach(forecast => {
            const forecastDate = new Date(forecast.dt * 1000);
            const dateStr = forecastDate.toDateString();
            
            if (!seenDates.has(dateStr) && dailyForecasts.length < maxForecastDays) {
                dailyForecasts.push(forecast);
                seenDates.add(dateStr);
            }
        });

        return dailyForecasts;
    }

    function getCurrentDateTime() {
        return new Date().toLocaleString();
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    function getWeatherIcon(weatherMain) {
        const iconMap = {
            'Clear': 'sun',
            'Clouds': 'cloud',
            'Rain': 'cloud-rain',
            'Snow': 'snowflake',
            'Thunderstorm': 'bolt',
            'Drizzle': 'cloud-rain',
            'Mist': 'smog',
            'Smoke': 'smog',
            'Haze': 'smog',
            'Dust': 'smog',
            'Fog': 'smog',
            'Sand': 'wind',
            'Ash': 'smog',
            'Squall': 'wind',
            'Tornado': 'tornado'
        };
        return iconMap[weatherMain] || 'cloud';
    }

    function getSearchHistory() {
        const storedHistory = localStorage.getItem('searchHistory');
        return storedHistory ? JSON.parse(storedHistory) : [];
    }


    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    

    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }


    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        
        // Update icon
        if (document.body.classList.contains('dark-theme')) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });
});
