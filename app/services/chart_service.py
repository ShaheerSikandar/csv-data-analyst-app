def apply_aggregation(df, x_column, y_column, aggregation):
    if aggregation == "sum":
        return df.groupby(x_column, as_index=False)[y_column].sum()

    if aggregation == "average":
        return df.groupby(x_column, as_index=False)[y_column].mean()

    if aggregation == "count":
        return df.groupby(x_column, as_index=False)[y_column].count()

    if aggregation == "min":
        return df.groupby(x_column, as_index=False)[y_column].min()

    if aggregation == "max":
        return df.groupby(x_column, as_index=False)[y_column].max()

    return df


def generate_chart(df, chart_type, x_column, y_column=None, aggregation="sum"):

    if chart_type in ["bar", "line"] and y_column:
        chart_df = apply_aggregation(df, x_column, y_column, aggregation)

        return {
            "data": [
                {
                    "type": chart_type,
                    "x": chart_df[x_column].tolist(),
                    "y": chart_df[y_column].astype(float).tolist(),
                }
            ],
            "layout": {
                "title": f"{aggregation.title()} of {y_column} by {x_column}",
                "xaxis": {"title": x_column},
                "yaxis": {"title": y_column},
            },
        }

    if chart_type == "scatter" and y_column:
        scatter_df = df[[x_column, y_column]].dropna() 
        return {
            "data": [
                {
                    "type": "scatter",
                    "mode": "markers",
                    "x": scatter_df[x_column].tolist(),
                    "y": scatter_df[y_column].tolist(),
                }
            ],
            "layout": {
                "title": f"{y_column} vs {x_column}",
                "xaxis": {"title": x_column},
                "yaxis": {"title": y_column},
            },
        }

    if chart_type == "histogram":
        return {
            "data": [
                {
                    "type": "histogram",
                    "x": df[x_column].dropna().tolist(),
                }
            ],
            "layout": {
                "title": f"Distribution of {x_column}",
                "xaxis": {"title": x_column},
                "yaxis": {"title": "Count"},
            },
        }

    return {"error": "Unsupported chart configuration."}