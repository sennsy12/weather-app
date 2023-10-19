document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '47a7f06dc56f615fc549ab04243a78fc'; // Replace with your OpenWeatherMap API key
    const maxSearchHistory = 3; // Maximum number of cities to display in the last search history

    const cityInput = document.getElementById('city');
    const searchButton = document.getElementById('search');
    const lastSearchElement = document.getElementById('last-search');
    let searchHistory = getSearchHistory(); // Retrieve search history from Local Storage

    searchButton.addEventListener('click', () => {
        const cityName = cityInput.value;
        if (cityName) {
            fetchWeatherData(cityName);
        }
    });

    async function fetchWeatherData(cityName) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(weatherUrl);
            if (response.status === 200) {
                const data = await response.json();
                searchHistory = updateSearchHistory(cityName, data);
                displaySearchHistory(searchHistory);
            } else {
                alert('Location not found. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

   
    function updateSearchHistory(cityName, weatherData) {
        searchHistory.unshift({ city: cityName, weatherData: weatherData });

        if (searchHistory.length > maxSearchHistory) {
            searchHistory.pop();
        }

        // Save the updated search history to Local Storage
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

        return searchHistory;
    }

    function getSearchHistory() {
        const storedHistory = localStorage.getItem('searchHistory');
        return storedHistory ? JSON.parse(storedHistory) : [];
    }

    function displaySearchHistory(searchHistory) {
        lastSearchElement.innerHTML = `
            <h2>Last Searched:</h2>
            <ul>
                ${searchHistory.map(entry => `
                    <li>
                        <h3>${entry.city}</h3>
                        ${entry.weatherData.main ? `
                            <p>Temperature: ${entry.weatherData.main.temp}°C</p>
                            <p>Weather: ${entry.weatherData.weather[0].description}</p>
                            <p>Humidity: ${entry.weatherData.main.humidity}%</p>
                        ` : '<p>Weather information not available.</p>'}
                    </li>
                `).join('')}
            </ul>
        `;
    }
});
