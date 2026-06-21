# Astra Space Explorer

Astra Space Explorer is a full-stack web application that allows users to explore the cosmos using NASA's Astronomy Picture of the Day (APOD) API.

## Live Demo
* **Frontend:** [View Live on Vercel](https://astra-space-explorer.vercel.app/)
* **Backend API:** Hosted securely on Render.

## Features
* **Daily APOD:** Automatically fetches and displays the Astronomy Picture of the Day.
* **Time Travel:** Search for any APOD dating back to June 16, 1995.
* **Random Explorer:** Jump to a random date in history.
* **Interactive Media:** Expand high-resolution images in a custom lightbox.
* **Share & Download:** Download high-res images or share specific dates via dynamic URLs.
* **Secure Architecture:** Utilizes a custom Node.js backend proxy to securely hide API keys.

## Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+), deployed on Vercel.
* **Backend:** Node.js, Express.js, deployed on Render.

## Project Architecture
To maintain security and prevent API key theft, this project uses a backend proxy structure:
1. The user interacts with the Frontend.
2. The Frontend sends a request to the custom Node.js Backend.
3. The Backend securely attaches the hidden NASA API key and fetches data from `api.nasa.gov`.
4. The Backend returns the pristine data to the Frontend to be rendered on the screen.
