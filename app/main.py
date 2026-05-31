from fastapi import FastAPI,File,UploadFile,Form 
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.services.data_service import (
    save_uploaded_file,
    load_dataframe,
    get_initial_summary
)
from app.services.cleaning_service import clean_dataframe
from app.services.chart_service import generate_chart
from app.services.analysis_service import highest_value_by_group, average_by_group, count_by_category, trend_over_time   
from app.services.analysis_service import correlation_analysis


app = FastAPI(title="CSV Data Analyst App")

CURRENT_FILE_PATH = None

app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/")
def home():
    return FileResponse("app/static/index.html")


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "CSV Data Analyst App is running"}


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    global CURRENT_FILE_PATH

    if not file.filename.endswith(".csv"):
        return {"error": "Please upload a CSV file."}

    CURRENT_FILE_PATH = await save_uploaded_file(file)

    df = load_dataframe(CURRENT_FILE_PATH)

    summary = get_initial_summary(df)

    return summary


@app.post("/clean")
def clean_data(remove_duplicates: bool = Form(False), missing_strategy: str = Form("none")):
    
    global CURRENT_FILE_PATH

    if CURRENT_FILE_PATH is None:
        return {"error": "No file uploaded. Please upload a CSV file first."}
    
    df = load_dataframe(CURRENT_FILE_PATH)

    cleaned_df, cleaning_report = clean_dataframe(
        df,
        remove_duplicates=remove_duplicates,
        missing_strategy=missing_strategy
    )

    cleaned_df.to_csv(CURRENT_FILE_PATH, index=False)

    updated_summary = get_initial_summary(cleaned_df)

    return {
        "cleaning_report": cleaning_report,
        "updated_summary": updated_summary
    }

@app.post("/chart")
def create_chart(chart_type: str = Form(...), x_column: str = Form(...), y_column: str = Form(None),
                   aggregation: str = Form("sum")):
    global CURRENT_FILE_PATH

    if CURRENT_FILE_PATH is None:
        return {"error": "No file uploaded. Please upload a CSV file first."}

    df = load_dataframe(CURRENT_FILE_PATH)

    if x_column not in df.columns or (y_column and y_column not in df.columns):
        return {"error": "Specified columns not found in the dataset."}

    chart_json = generate_chart(df =df, chart_type=chart_type, x_column=x_column, y_column=y_column,
                                aggregation=aggregation)

    return {"chart": chart_json}

@app.post("/analyze/highest")
def analyze_highest_value(
    group_column: str = Form(...),
    value_column: str = Form(...)
):
    global CURRENT_FILE_PATH

    if CURRENT_FILE_PATH is None:
        return {"error": "No file uploaded yet."}

    df = load_dataframe(CURRENT_FILE_PATH)

    result = highest_value_by_group(
        df=df,
        group_column=group_column,
        value_column=value_column
    )

    return {"analysis_result": result}

@app.post("/analyze/average")
def analyze_average(
    group_column: str = Form(...),
    value_column: str = Form(...)
):
    global CURRENT_FILE_PATH

    if CURRENT_FILE_PATH is None:
        return {"error": "No file uploaded yet."}

    df = load_dataframe(CURRENT_FILE_PATH)

    result = average_by_group(
        df=df,
        group_column=group_column,
        value_column=value_column
    )

    return {"analysis_result": result}

@app.post("/analyze/count")
def analyze_count(
    category_column: str = Form(...)
):
    global CURRENT_FILE_PATH

    if CURRENT_FILE_PATH is None:
        return {"error": "No file uploaded yet."}

    df = load_dataframe(CURRENT_FILE_PATH)

    result = count_by_category(
        df=df,
        category_column=category_column
    )

    return {"analysis_result": result}

@app.post("/analyze/trend")
def analyze_trend(
    date_column: str = Form(...),
    value_column: str = Form(...)
):
    global CURRENT_FILE_PATH

    if CURRENT_FILE_PATH is None:
        return {"error": "No file uploaded yet."}

    df = load_dataframe(CURRENT_FILE_PATH)

    result = trend_over_time(
        df=df,
        date_column=date_column,
        value_column=value_column
    )

    return {"analysis_result": result}

@app.post("/analyze/correlation")
def analyze_correlation(
    column_a: str = Form(...),
    column_b: str = Form(...)
):
    global CURRENT_FILE_PATH

    if CURRENT_FILE_PATH is None:
        return {"error": "No file uploaded yet."}

    df = load_dataframe(CURRENT_FILE_PATH)

    result = correlation_analysis(
        df=df,
        column_a=column_a,
        column_b=column_b
    )

    return {"analysis_result": result}

@app.get("/download-cleaned")
def download_cleaned_file():
    global CURRENT_FILE_PATH

    if CURRENT_FILE_PATH is None:
        return {"error": "No cleaned file available. Please upload and clean a CSV first."}

    return FileResponse(
        path=CURRENT_FILE_PATH,
        filename="cleaned_data.csv",
        media_type="text/csv"
    )
