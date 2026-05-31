# CSV Data Analyst App

A FastAPI-based web application that allows users to upload, clean, analyze, and visualize CSV datasets directly from the browser.

---

## Features

### Data Summary
- Upload CSV files
- Display row count
- Display column count
- Detect missing values
- Detect duplicate rows
- Show column names

### Data Cleaning
- Remove duplicate records
- Handle missing values using different strategies
- Download cleaned dataset

### Visualization
- Bar Charts
- Line Charts
- Scatter Plots
- Aggregations (Sum, Average, Count)

### Quick Analysis
- Average by Group
- Highest Value by Group
- Count by Category
- Trend Over Time
- Correlation Analysis

---

## Tech Stack

### Backend
- Python
- FastAPI
- Pandas
- NumPy

### Frontend
- HTML
- CSS
- JavaScript

### Visualization
- Plotly.js

### Version Control
- Git
- GitHub

---

## Project Structure

```text
app/
├── services/
│   ├── analysis_service.py
│   ├── chart_service.py
│   ├── cleaning_service.py
│   └── data_service.py
│
├── static/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
└── main.py
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/ShaheerSikandar/csv-data-analyst-app.git
```

Move into the project:

```bash
cd csv-data-analyst-app
```

Create virtual environment:

```bash
python -m venv venv
```

Activate environment:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the application:

```bash
uvicorn app.main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

---
---

## Run with Docker

Make sure Docker Desktop is installed and running.

Build the Docker image:

```bash
docker build -t csv-data-analyst-app .
```

Run the container:

```bash
docker run -p 8000:8000 csv-data-analyst-app
```

Open the application:

```text
http://127.0.0.1:8000
```

To stop the container:

```bash
Ctrl + C
```

## Example Dataset

The application was tested using the Kaggle Superstore Sales Dataset.

---
## Skills Demonstrated

- Data Cleaning with Pandas
- Exploratory Data Analysis (EDA)
- Data Visualization
- FastAPI Backend Development
- REST API Design
- Frontend Development (HTML/CSS/JavaScript)
- Git & GitHub
- Docker 

## Future Improvements

- Better loading indicators
- Additional chart types
- Export charts as images
- Statistical summaries
- AI-powered data insights


---

## Author

Shaheer Sikandar