var weatherIcons = [
    { icon: "sun", description: "Sun" },
    { icon: "sun-overcast", description: "Slightly overcast" },
    { icon: "sun-overcast-rain", description: "Rain" },
    { icon: "overcast", description: "Overcast" },
    { icon: "overcast-rain", description: "Overcast with rain" },
    { icon: "thunderstorm", description: "Thunderstorm" },
    { icon: "fog", description: "Fog" },
    { icon: "snow", description: "Snow" },
    { icon: "hail", description: "Hail" }
]

var mapValueToScale = function(value, oldMin, oldMax, newMin, newMax) {
    return (newMax - newMin) - (value - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin;
}

var updateWeather = function (icon, description) {
    var weatherIcon = document.querySelector("#weather-icon use");
    var weatherLabel = document.querySelector("#weather-label");

    weatherIcon.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/icons/_icons.svg#" + icon);
    weatherLabel.textContent = description;
}

var updateTemperature = function (temperature) {
    var tempIcon = document.querySelector("#temp-icon #bar");
    var tempCircle = document.querySelector("#temp-icon #circle");
    var tempLabel = document.querySelector("#temp-label");

    var maxTemp = 30;
    var minTemp = 0;
    var tempIconC = tempIcon.getBBox();
    var tempIconXOrigin = tempIconC.x + (tempIconC.width / 2);
    var tempIconYOrigin = tempIconC.y + tempIconC.height;
    var tempPercentage = temperature / (maxTemp - minTemp);
    var scalePercentage = (tempPercentage / 1.2) + (1 - (1 / 1.2));
    var fColor;

    tempIcon.style.transformOrigin = tempIconXOrigin + "px " + tempIconYOrigin + "px";
    tempIcon.style.transform = "scaleY(" + scalePercentage + ")";
    tempIcon.style.transition = "transform 2s ease, fill  1s ease";
    tempCircle.style.transition = "transform 2s ease, fill  1s ease";

    if (temperature <= (maxTemp / 3)) {
        fColor = "blue";
    }
    else if (temperature > (maxTemp / 3) && temperature < (maxTemp / 3) * 2) {
        fColor = "orange";
    }
    else if (temperature >= (maxTemp / 3) * 2) {
        fColor = "red";
    }
    tempIcon.style.fill = fColor;
    tempCircle.style.fill = fColor;
    tempLabel.textContent = temperature + "°C";
}

var updateWind = function (direction, description) {
    var windIcon = document.querySelector("#wind-icon use");
    var windLabel = document.querySelector("#wind-label");

    windIcon.style.transformOrigin = "center";
    windIcon.style.transition = "transform 2s ease";
    windIcon.style.transform = "rotate(" + direction + "deg)";
    windLabel.textContent = description;
}

var updateChart = function (data, type) {
    var forecastChart = document.querySelector("#forecast-chart");

    // Clear
    forecastChart.innerHTML = "";

    var viewBox = forecastChart.viewBox.baseVal,
        chartPosition = { xMin: 45, xMax: viewBox.width - 15, yMin: 15, yMax: viewBox.height - 45 },
        xSubdivide = data.length,
        ySubdivide = 5,
        scale = { min: Math.floor(Math.min(...data.map(x => x.value)) / 5) * 5, max: Math.ceil(Math.max(...data.map(x => x.value)) / 5) * 5 },
        columnWidth = (chartPosition.xMax - chartPosition.xMin) / xSubdivide;

    for (let i = 0; i < ySubdivide; i++) {
        // Horizontal lines
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path"),
            x = chartPosition.xMin,
            y = mapValueToScale(i, 0, (ySubdivide - 1), chartPosition.yMin, chartPosition.yMax),
            l = chartPosition.xMax - chartPosition.xMin;

        path.style.stroke = "909090";
        path.style.strokeWidth = "0.5";
        path.style.fill = "none";
        path.setAttribute("d", "m" + x + " " + y + "h" + l);

        forecastChart.append(path);

        // Y axis
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        var x = chartPosition.xMin - 40;
        var y = mapValueToScale(i, 0, (ySubdivide - 1), chartPosition.yMin, chartPosition.yMax);

        text.textContent = mapValueToScale(i, 0, (ySubdivide - 1), scale.max, scale.min) + type;
        text.setAttribute("font-size", "10");
        text.setAttribute("x", x);
        text.setAttribute("y", y + 3.5);

        forecastChart.append(text);
    }

    var d = "M ";
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.style.stroke = "black";
    path.style.strokeWidth = "1.0";
    path.style.fill = "none";
    path.style.strokeDasharray = "650";
    path.style.animation = "dash 2s ease";

    for (let i = 0; i < xSubdivide; i++) {
        // X axis
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.textContent = data[i].date;
        text.setAttribute("font-size", "10");

        var x = (chartPosition.xMin + columnWidth / 3) + (columnWidth * i);
        var y = chartPosition.yMax + 25;

        text.setAttribute("x", x);
        text.setAttribute("y", y);

        forecastChart.append(text);

        // Line
        var x = (chartPosition.xMin + columnWidth / 2) + (columnWidth * i);
        var y = mapValueToScale(data[i].value, scale.min, scale.max, chartPosition.yMin, chartPosition.yMax);

        if (!i) d += x + " " + y;
        else    d += " L " + x + " " + y;

        // Dot
        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("r", 2.5);
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);

        // Hover
        var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = data[i].date + "\n" + data[i].value + type;

        circle.append(title);
        forecastChart.append(circle);
    }
    path.setAttribute("d", d);
    forecastChart.prepend(path);
}

var init = function () {
    var weatherIndex = Math.floor(Math.random() * (weatherIcons.length - 1));
    updateWeather(weatherIcons[weatherIndex].icon, weatherIcons[weatherIndex].description);
    updateTemperature(Math.round(Math.random() * 30));
    updateWind(Math.round(Math.random() * 360), Math.round(Math.random() * 5) + " Bft");
    updateChart([
        { date: "1/01", value: Math.round(Math.random() * 30) },
        { date: "2/01", value: Math.round(Math.random() * 30) },
        { date: "3/01", value: Math.round(Math.random() * 30) },
        { date: "4/01", value: Math.round(Math.random() * 30) },
        { date: "5/01", value: Math.round(Math.random() * 30) },
        { date: "6/01", value: Math.round(Math.random() * 30) },
        { date: "7/01", value: Math.round(Math.random() * 30) }
    ], "°C");
}

init();

setInterval(() => {
    init();
}, 4000);