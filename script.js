document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '47a7f06dc56f615fc549ab04243a78fc'; // Replace with your OpenWeatherMap API key
    const maxSearchHistory = 3; // Maximum number of cities to display in the last search history

    const cityInput = document.getElementById('city');
    const searchButton = document.getElementById('search');
    const lastSearchCityElement = document.getElementById('last-search-city');
    const searchHistory = []; // Array to store the search history

    searchButton.addEventListener('click', () => {
        const cityName = cityInput.value;
        if (cityName) {
            fetchWeatherData(cityName);
            updateSearchHistory(cityName);
        }
    });

    async function fetchWeatherData(cityName) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(weatherUrl);
            if (response.status === 200) {
                const data = await response.json();
                displayWeatherData(data);
            } else {
                alert('Location not found. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    function displayWeatherData(data) {
        const currentWeatherElement = document.getElementById('current-weather');
        if (data && data.weather && data.weather[0] && data.main) {
            currentWeatherElement.innerHTML = `
                <h2>Current Weather</h2>
                <p>Temperature: ${data.main.temp}°C</p>
                <p>Weather: ${data.weather[0].description}</p>
                <p>Humidity: ${data.main.humidity}%</p>
            `;
        } else {
            currentWeatherElement.innerHTML = 'Weather information not available.';
        }
    }

    function updateSearchHistory(cityName) {
        // Add the cityName to the beginning of the search history array
        searchHistory.unshift(cityName);

        // Trim the search history array to the maximum number of cities
        if (searchHistory.length > maxSearchHistory) {
            searchHistory.pop();
        }

        // Update the "Last Searched" section with the last three search history entries
        lastSearchCityElement.innerHTML = `
            <h2>Last Searched:</h2>
            <ul>
                ${searchHistory.slice(0, maxSearchHistory).map(city => `<li>${city}</li>`).join('')}
            </ul>
        `;
    }
});
