def highest_value_by_group(df, group_column, value_column):
    result = (
        df.groupby(group_column)[value_column]
        .max()
        .sort_values(ascending=False)
        .reset_index()
    )

    return result.to_dict(orient="records")

def average_by_group(df, group_column, value_column):

    result = (
        df.groupby(group_column)[value_column]
        .mean()
        .reset_index()
        .sort_values(value_column, ascending=False)
    )

    result[value_column] = result[value_column].round(2)

    return result.to_dict(orient="records")

def count_by_category(df, category_column):
    result = (
        df.groupby(category_column)
        .size()
        .reset_index(name="count")
        .sort_values(by="count", ascending=False)
    )

    return result.to_dict(orient="records")

def trend_over_time(df, date_column, value_column):
    result = (
        df.groupby(date_column, as_index=False)[value_column]
        .sum()
        .sort_values(date_column)
    )

    return result.to_dict(orient="records")

def correlation_analysis(df, column_a, column_b):

    clean_df = df[[column_a, column_b]].dropna()
    correlation = clean_df[column_a].corr(clean_df[column_b])

    return {
        "column_a": column_a,
        "column_b": column_b,
        "correlation": round(float(correlation), 4),
        "data": clean_df.to_dict(orient="records")
    }