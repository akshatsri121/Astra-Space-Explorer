# Astra: NASA Space Dashboard

## Overview
This project is an interactive, Python-based web application that uses data from NASA's Open APIs. The dashboard will be designed to provide a clean and accessible interface for exploring high-resolution space imagery and planetary rover data.

## Features
The dashboard currently supports two primary modules:
* **Astronomy Picture of the Day (APOD):** Retrieves the daily featured image or video from NASA, alongside the official scientific explanation. Users can also select past dates to explore the archive.
* **Mars Rover Gallery:** Provides a window into the surface of Mars. Users can select between different rovers (Curiosity, Opportunity, or Spirit) and input a specific Martian solar day (Sol) to view the exact images captured by the rover's cameras on that day.

## Architecture

The basic data flow is as follows:
1. **User Input:** The user inputs parameters (such as a specific date, rover name etc)
2. **Request Formatting:** The Python script uses these inputs and formats an HTTP request, appending the required NASA API key for authentication.
3. **API Call:** The request is sent to the respective NASA endpoint (either the APOD or Mars Photos API).
4. **Data Parsing and Rendering:** on receiving a response, the application parses the JSON payload, extracts the relevant media URLs and textual data, and renders the layout on the screen.

## Tech Stack
* **Language:** Python 3
* **Web Framework:** Streamlit (handles UI layout, user inputs, and rendering)
* **Network Communication:** `requests` library
* **Data Source:** NASA Open APIs

## Project Structure

