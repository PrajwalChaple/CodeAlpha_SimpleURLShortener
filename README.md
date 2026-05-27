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

## 🚀 Setup & Installation Guide

### Prerequisites
- Python 3.10+ (Verified on Python 3.14)
- Git (for source control)

### Step 1: Clone the Repository
```bash
git clone https://github.com/PrajwalChaple/CodeAlpha_SimpleURLShortener.git
cd CodeAlpha_SimpleURLShortener
```

### Step 2: Install Dependencies
Install Flask from the standard `requirements.txt`:
```bash
pip install -r requirements.txt
```

### Step 3: Run the Application
Start the Flask dev server on your local system:
```bash
python app.py
```
*The database file `db.sqlite3` will automatically be generated in the root directory upon startup!*

### Step 4: Access the Console
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 💻 Tech Stack & Design Choices

1. **Python Flask**: Extremely lightweight, enabling high-performance, single-threaded SQLite operations without bloating overhead.
2. **SQLite3**: Standard zero-dependency relational database, entirely local and robust across operating systems without external daemon processes.
3. **Pure Vanilla CSS**: Avoids CSS compiler or utility overhead, utilizing modern browser-native properties (`backdrop-filter`, standard grid layouts, custom variables).
4. **Google Fonts**: Uses *Outfit* for crisp headlines and *Plus Jakarta Sans* for clean, highly legible telemetry readouts.
5. **No Native Compile Dependencies**: By serving from pure JavaScript libraries and SQLite, developers can deploy this application on Windows without needing Visual Studio Build Tools or C++ compilation.
