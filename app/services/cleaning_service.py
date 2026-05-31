import pandas as pd


def clean_dataframe(df: pd.DataFrame, remove_duplicates: bool, missing_strategy: str):
    report = {
        "initial_rows": int(df.shape[0]),
        "initial_duplicates": int(df.duplicated().sum()),
        "initial_missing_values": df.isnull().sum().astype(int).to_dict(),
        "actions_performed": []
    }

    if remove_duplicates:
        before = df.shape[0]
        df = df.drop_duplicates()
        after = df.shape[0]

        report["actions_performed"].append(
            f"Removed {before - after} duplicate rows."
        )

    if missing_strategy == "drop_rows":
        before = df.shape[0]
        df = df.dropna()
        after = df.shape[0]

        report["actions_performed"].append(
            f"Dropped {before - after} rows with missing values."
        )

    elif missing_strategy == "fill_mean":
        numeric_columns = df.select_dtypes(include=["number"]).columns

        for column in numeric_columns:
            df[column] = df[column].fillna(df[column].mean())

        report["actions_performed"].append(
            "Filled missing numeric values with mean."
        )

    elif missing_strategy == "fill_median":
        numeric_columns = df.select_dtypes(include=["number"]).columns

        for column in numeric_columns:
            df[column] = df[column].fillna(df[column].median())

        report["actions_performed"].append(
            "Filled missing numeric values with median."
        )

    elif missing_strategy == "fill_unknown":
        text_columns = df.select_dtypes(include=["object", "category"]).columns

        for column in text_columns:
            df[column] = df[column].fillna("Unknown")

        report["actions_performed"].append(
            "Filled missing text values with 'Unknown'."
        )

    elif missing_strategy == "auto":
        numeric_columns = df.select_dtypes(include=["number"]).columns
        text_columns = df.select_dtypes(include=["object", "category"]).columns

        for column in numeric_columns:
            df[column] = df[column].fillna(df[column].median())

        for column in text_columns:
            df[column] = df[column].fillna("Unknown")

        report["actions_performed"].append(
            "Auto-cleaning applied: numeric values filled with median, text values filled with 'Unknown'."
        )

    else:
        report["actions_performed"].append(
            "No missing value handling applied."
        )

    report["final_rows"] = int(df.shape[0])
    report["final_missing_values"] = df.isnull().sum().astype(int).to_dict()

    return df, report