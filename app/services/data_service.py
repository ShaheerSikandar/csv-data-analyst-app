import os
import pandas as pd
from fastapi import UploadFile

UPLOAD_DIR = "app/uploads"

async def save_uploaded_file(file: UploadFile):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)

    return file_path


def load_dataframe(file_path: str):
    try:
        return pd.read_csv(file_path)
    except UnicodeDecodeError:
        return pd.read_csv(file_path, encoding="latin1")


def get_initial_summary(df: pd.DataFrame):
    
    summary = {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": df.columns.tolist(),
        "data_types": df.dtypes.astype(str).to_dict(),
        "duplicate_rows": int(df.duplicated().sum()),
        "missing_values": df.isnull().sum().astype(int).to_dict(),
        "summary_statistics": df.describe(include="all").fillna("").to_dict()
    }

    return summary