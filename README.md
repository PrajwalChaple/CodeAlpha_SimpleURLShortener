# ⚡ TinyPath — Premium URL Shortener & Real-Time Analytics

TinyPath is a premium, self-hosted, lightweight, and futuristic **URL Shortener** built with **Flask (Python)**, **SQLite**, and a jaw-dropping **Glassmorphic Vanilla HTML/CSS/JS frontend**.

Designed with a sleek deep space theme, TinyPath compresses long destination URLs into collision-resistant 6-character short codes, tracks redirection clicks, auto-generates QR codes, and keeps a beautiful local history registry using browser session memory.

---

## ✨ Features

- **🚀 Express Shortening**: Generates alphanumeric short codes (base62) that scale to billions of combinations, collision-free.
- **✨ Stunning Glassmorphic UI**: Ultra-premium spaceship dashboard theme featuring custom CSS translucent panels, glowing inputs, backdrop filters (`blur(14px)`), and smooth hover micro-animations.
- **📊 Live Telemetry (Analytics)**: Dedicated real-time dashboard showing creation dates, ages, target URLs, and live click redirection counters.
- **💾 Browser Connection Registry**: Persistent past link history in the client browser (`localStorage`), complete with quick-copy utilities, target links, and manual click-sync refresh triggers.
- **📱 Instant QR Codes**: Automatically creates a downloadable high-resolution QR code for every shortened path using public secure APIs.
- **🛡️ Dynamic Normalization**: Automatically handles URLs missing the `http://` or `https://` protocols, providing seamless user redirection.
- **🌌 Astro-404 Experience**: Dedicated gorgeous astronomical 404 page for broken or non-existent short codes.

---

## 📂 Project Architecture

```directory
CodeAlpha_SimpleURLShortener/
│
├── app.py                # Main Flask application and REST API controllers
├── db.py                 # SQLite database helper module & schema initialization
├── requirements.txt      # Python package dependencies
├── .gitignore            # Version control exclusions (ignores SQLite binary, caches)
│
├── templates/
│   ├── index.html        # Glassmorphic single page application layout
│   └── 404.html          # Custom error page for missing codes
│
└── static/
    ├── css/
    │   └── style.css     # Premium styling, animations, responsive custom variables
    └── js/
        └── main.js       # Dynamic AJAX logic, localStorage persistence, QR loading, tooltips
```

---

## 🛠️ API Specification

### 1. Shorten URL
Compresses a long destination URL.
- **Endpoint**: `POST /api/shorten`
- **Payload Format**: JSON or Form Data
- **Request Body**:
  ```json
  {
    "url": "https://github.com/PrajwalChaple/CodeAlpha_SimpleURLShortener"
  }
  ```
- **Response Schema**:
  ```json
  {
    "success": true,
    "short_code": "t8G3wS",
    "short_url": "http://127.0.0.1:5000/t8G3wS",
    "original_url": "https://github.com/PrajwalChaple/CodeAlpha_SimpleURLShortener"
  }
  ```

### 2. Fetch Link Telemetry
Retrieves real-time analytics data.
- **Endpoint**: `GET /api/analytics/<short_code>`
- **Response Schema**:
  ```json
  {
    "success": true,
    "short_code": "t8G3wS",
    "original_url": "https://github.com/PrajwalChaple/CodeAlpha_SimpleURLShortener",
    "clicks": 42,
    "created_at": "2026-05-27 18:00:00"
  }
  ```

### 3. Redirection
Redirects the client to the original target and increments the click counter.
- **Endpoint**: `GET /<short_code>`
- **Response**: `302 Found` (Redirects to original destination)

---

## 🚀 Setup & Deployment Guide

### ⚠️ A Note on GitHub Pages Deployment
> [!WARNING]
> **GitHub Pages only hosts static sites** (HTML, CSS, JS) and cannot run server-side code like Python Flask or databases like SQLite. 
> 
> Because of this, if you try to deploy this project directly to GitHub Pages:
> 1. It will fall back to displaying the `README.md` file since there is no `index.html` file at the root level (it is in `templates/`).
> 2. The dynamic database operations (shortening links and tracking clicks) will not work.
> 
> To run or deploy this app, follow either **Local Setup** or **Free Cloud Hosting (Render)** below.

---

### 💻 Local Run Guide (Your Computer)

#### Prerequisites
- **Python 3.10+** (Verified on Python 3.14)
- **Git** (for version control)

#### Step 1: Open Terminal in Project Folder
Clone the repository or navigate to your local project folder:
```bash
git clone https://github.com/PrajwalChaple/CodeAlpha_SimpleURLShortener.git
cd CodeAlpha_SimpleURLShortener
```

#### Step 2: Install Required Libraries
Install Flask from the standard `requirements.txt` file:
```bash
pip install -r requirements.txt
```

#### Step 3: Start the Backend Server
Run the Flask server using python:
```bash
python app.py
```
*Note: Upon startup, the database file `db.sqlite3` will automatically be generated in the root directory!*

#### Step 4: Open Console in Browser
Open your browser and navigate to:
```
http://127.0.0.1:5000
```
You can now shorten links, copy them, download QR codes, and track telemetry counters!

---

### ☁️ Free Cloud Deployment Guide (Render.com)

To make your URL shortener accessible to anyone on the internet for free, deploy it on **Render.com**:

#### Step 1: Add a WSGI Server (Gunicorn)
To run Flask reliably in production, Gunicorn is recommended.
1. Open `requirements.txt` and append `gunicorn` on a new line:
   ```text
   Flask>=3.0.0
   gunicorn
   ```
2. Save the file and push this change to your GitHub repository:
   ```bash
   git add requirements.txt
   git commit -m "chore: Add gunicorn dependency for cloud production hosting"
   git push origin main
   ```

#### Step 2: Setup Web Service on Render
1. Create a free account on [Render.com](https://render.com/).
2. Click **New +** on the dashboard and select **Web Service**.
3. Connect your GitHub account and select your repository: `CodeAlpha_SimpleURLShortener`.
4. Configure the following settings during creation:
   - **Name**: `tinypath-shortener` (or any name you like)
   - **Region**: Select the closest region to you (e.g., Singapore or Oregon)
   - **Branch**: `main`
   - **Language**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: `Free` (Standard free tier)
5. Click **Deploy Web Service**.

#### Step 3: Access your Live URL
Once the deployment status changes to **Live**, Render will provide you with a public URL (e.g., `https://tinypath-shortener.onrender.com`).
Open the link to access your premium glassmorphic URL shortener console from anywhere on any device!

---

## 💻 Tech Stack & Design Choices

1. **Python Flask**: Extremely lightweight, enabling high-performance, single-threaded SQLite operations without bloating overhead.
2. **SQLite3**: Standard zero-dependency relational database, entirely local and robust across operating systems without external daemon processes.
3. **Pure Vanilla CSS**: Avoids CSS compiler or utility overhead, utilizing modern browser-native properties (`backdrop-filter`, standard grid layouts, custom variables).
4. **Google Fonts**: Uses *Outfit* for crisp headlines and *Plus Jakarta Sans* for clean, highly legible telemetry readouts.
5. **No Native Compile Dependencies**: By serving from pure JavaScript libraries and SQLite, developers can deploy this application on Windows without needing Visual Studio Build Tools or C++ compilation.
